<?php

namespace App\Http\Services\Sync;

use App\Http\Repository\DepartmentRepository;
use App\Http\Repository\SourceRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Repository\SyncErrorRepository;
use App\Http\Repository\SyncRunRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Services\Student\DuplicateDetectionService;
use App\Http\Services\Student\StudentRules;
use App\Http\Resources\SyncRunResource;
use App\Models\SyncRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Throwable;

/** Orchestrates one full ETL or REST synchronisation run across department sources. */
final class RunSyncService
{
    use ApiResponses;

    private const SOURCE_DEPARTMENTS = [
        'education' => 'COE',
        'it' => 'CIT',
        'hospitality' => 'CHM',
    ];

    public static function RunSync(Request $request): JsonResponse
    {
        $data = $request->validated();

        $sourceKey = $data['department_code'] ?? null;
        $method = $data['method'] ?? 'etl';

        $runs = new SyncRunRepository;
        $department = null;

        if ($sourceKey !== null) {
            $department = (new DepartmentRepository)->findByCode(self::SOURCE_DEPARTMENTS[$sourceKey]);

            if ($department === null) {
                return self::error('The department source is not configured.', 'notValid');
            }
        }

        try {
            $run = $runs->create([
                'department_id' => $department?->id,
                'method' => $method,
                'status' => 'running',
                'started_at' => now(),
            ]);
        } catch (Throwable) {
            return self::error('Unable to start the synchronisation run.');
        }

        try {
            $counts = [
                'extracted' => 0,
                'loaded' => 0,
                'updated' => 0,
                'skipped' => 0,
                'duplicates' => 0,
                'failed' => 0,
            ];

            $studentRepository = new StudentRepository;
            $errors = new SyncErrorRepository;
            $sources = new SourceRepository;
            $keys = $sourceKey !== null ? [$sourceKey] : array_keys(self::SOURCE_DEPARTMENTS);

            foreach ($keys as $key) {
                try {
                    $payload = $method === 'rest'
                        ? $sources->fetchRemote($key)
                        : $sources->readFile($key);

                    if ($payload === null || ! isset($payload['records']) || ! is_array($payload['records'])) {
                        throw new \RuntimeException('invalid source payload');
                    }
                } catch (Throwable) {
                    $errors->create([
                        'sync_run_id' => $run->id,
                        'row_identifier' => 'source:'.$key,
                        'message' => 'The source could not be read.',
                        'payload' => null,
                    ]);
                    $counts['failed']++;

                    continue;
                }

                foreach ($payload['records'] as $index => $record) {
                    if (! is_array($record)) {
                        $errors->create([
                            'sync_run_id' => $run->id,
                            'row_identifier' => 'row-'.($index + 1),
                            'message' => 'The source row is not a valid object.',
                            'payload' => null,
                        ]);
                        $counts['failed']++;
                        $counts['extracted']++;

                        continue;
                    }

                    $counts['extracted']++;
                    $identifier = self::identifier($record, $index);

                    try {
                        $prepared = EtlService::Transform($record, $key);
                        $validator = Validator::make($prepared, StudentRules::rules());

                        if ($validator->fails()) {
                            $errors->create([
                                'sync_run_id' => $run->id,
                                'row_identifier' => $identifier,
                                'message' => implode(' ', $validator->errors()->all()),
                                'payload' => $record,
                            ]);
                            $counts['failed']++;

                            continue;
                        }

                        $validated = $validator->validated();
                        $validated['program_id'] = $prepared['program_id'];
                        $validated['department_id'] = $prepared['department_id'];
                        $validated['year_level'] = $prepared['year_level'];
                        $validated['status'] = $prepared['status'];
                        $validated['source'] = $key;

                        $existing = $studentRepository->findByStudentNumber($validated['student_number']);

                        if ($existing !== null) {
                            $changes = EtlService::ChangedValues($existing, $validated);

                            if ($changes === []) {
                                $counts['skipped']++;
                            } else {
                                $studentRepository->update($existing, $changes);
                                $counts['updated']++;
                            }

                            continue;
                        }

                        $candidate = DuplicateDetectionService::FindCandidates($validated);

                        if ($candidate !== null) {
                            $studentRepository->create([
                                ...$validated,
                                'integrity_status' => 'duplicate_suspect',
                                'duplicate_of_id' => $candidate['student']->id,
                            ]);
                            $counts['duplicates']++;
                        } else {
                            $studentRepository->create([
                                ...$validated,
                                'integrity_status' => 'clean',
                                'duplicate_of_id' => null,
                            ]);
                            $counts['loaded']++;
                        }
                    } catch (Throwable) {
                        $errors->create([
                            'sync_run_id' => $run->id,
                            'row_identifier' => $identifier,
                            'message' => 'The row could not be processed.',
                            'payload' => $record,
                        ]);
                        $counts['failed']++;
                    }
                }
            }

            $succeeded = $counts['loaded'] + $counts['updated'] + $counts['skipped'] + $counts['duplicates'];
            $status = match (true) {
                $counts['failed'] === 0 => 'success',
                $succeeded > 0 => 'partial',
                default => 'failed',
            };

            $run = $runs->update($run, [
                ...$counts,
                'status' => $status,
                'message' => sprintf(
                    '%s sync finished: %d extracted, %d loaded, %d updated, %d skipped, %d duplicates, %d failed.',
                    strtoupper($method),
                    $counts['extracted'],
                    $counts['loaded'],
                    $counts['updated'],
                    $counts['skipped'],
                    $counts['duplicates'],
                    $counts['failed'],
                ),
                'finished_at' => now(),
            ]);

            $run->load(['department', 'syncErrors']);

            return self::success(
                'Synchronisation completed.',
                (new SyncRunResource($run))->resolve(),
            );
        } catch (Throwable) {
            self::markFailed($runs, $run);

            return self::error('Unable to complete the synchronisation run.');
        }
    }

    /**
     * @param  array<string, mixed>  $record
     */
    private static function identifier(array $record, int $index): string
    {
        $value = $record['student_number'] ?? $record['studentNumber'] ?? null;

        return $value !== null && trim((string) $value) !== ''
            ? mb_substr(trim((string) $value), 0, 255)
            : 'row-'.($index + 1);
    }

    private static function markFailed(SyncRunRepository $repository, SyncRun $run): void
    {
        try {
            $repository->update($run, [
                'status' => 'failed',
                'message' => 'The synchronisation run failed unexpectedly.',
                'finished_at' => now(),
            ]);
        } catch (Throwable) {
            // The original failure is already returned as a generic envelope.
        }
    }
}
