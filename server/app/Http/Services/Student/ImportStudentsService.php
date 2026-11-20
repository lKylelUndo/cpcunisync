<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Requests\Student\ImportStudentsRequest;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Services\Sync\EtlService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Bulk-imports students from a CSV upload.
 *
 * Each row is normalized through the ETL pipeline (EtlService::Transform)
 * and reconciled with the same rules the sync runs use: rows matching an
 * existing student number update or skip; unknown students are created,
 * with likely duplicates flagged as duplicate_suspect instead of merged.
 */
final class ImportStudentsService
{
    use ApiResponses;

    private const SOURCE_KEY = 'csv-import';

    /**
     * @return array<string, mixed>
     */
    private static function newSummary(): array
    {
        return [
            'total' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'duplicates' => 0,
            'failed' => 0,
            'errors' => [],
        ];
    }

    public static function Import(ImportStudentsRequest $request): JsonResponse
    {
        $file = $request->file('file');

        $summary = self::newSummary();

        $handle = fopen($file->getRealPath() ?: $file->getPathname(), 'r');

        if ($handle === false) {
            return self::error('The uploaded file could not be read.');
        }

        $studentRepository = new StudentRepository;

        try {
            $header = fgetcsv($handle);

            if ($header === false) {
                return self::success('Student import completed.', $summary);
            }

            $header = array_map(static fn (mixed $value): string => trim((string) $value), $header);
            $header[0] = self::stripBom($header[0] ?? '');

            self::validateTemplateColumns($header);

            $rowNumber = 1;

            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                $row = array_map(static fn (mixed $value): string => (string) $value, $row);

                if (trim(implode('', $row)) === '') {
                    continue;
                }

                $summary['total']++;

                $payload = [];
                $identifier = '';

                try {
                    foreach ($header as $index => $name) {
                        if ($name !== '') {
                            $payload[$name] = $row[$index] ?? null;
                        }
                    }

                    $identifier = trim((string) ($payload['student_number'] ?? ''));

                    $prepared = EtlService::Transform($payload, self::SOURCE_KEY);

                    $validator = Validator::make($prepared, StudentRules::rules());

                    if ($validator->fails()) {
                        $summary['failed']++;
                        $summary['errors'][] = [
                            'row' => $rowNumber,
                            'identifier' => $identifier,
                            'message' => implode(' ', $validator->errors()->all()),
                            'raw_row' => $row,
                        ];

                        continue;
                    }

                    $existing = $studentRepository->findByStudentNumber($prepared['student_number']);

                    if ($existing !== null) {
                        $changes = EtlService::ChangedValues($existing, $prepared);

                        if ($changes === []) {
                            $summary['skipped']++;
                        } else {
                            $studentRepository->update($existing, $changes);
                            $summary['updated']++;
                        }

                        continue;
                    }

                    $candidate = DuplicateDetectionService::FindCandidates($prepared);

                    if ($candidate !== null) {
                        $studentRepository->create([
                            ...$prepared,
                            'integrity_status' => 'duplicate_suspect',
                            'duplicate_of_id' => $candidate['student']->id,
                        ]);
                        $summary['created']++;
                        $summary['duplicates']++;
                    } else {
                        $studentRepository->create([
                            ...$prepared,
                            'integrity_status' => 'clean',
                            'duplicate_of_id' => null,
                        ]);
                        $summary['created']++;
                    }
                } catch (Throwable $exception) {
                    $summary['failed']++;
                    $summary['errors'][] = [
                        'row' => $rowNumber,
                        'identifier' => $identifier,
                        'message' => $exception->getMessage(),
                        'raw_row' => $row,
                    ];
                }
            }
        } finally {
            fclose($handle);
        }

        if ($summary['total'] === 0) {
            throw ValidationException::withMessages(['file' => 'CSV contains no student rows.']);
        }

        $message = sprintf(
            'Student import completed: %d total, %d created, %d updated, %d skipped, %d duplicates, %d failed.',
            $summary['total'],
            $summary['created'],
            $summary['updated'],
            $summary['skipped'],
            $summary['duplicates'],
            $summary['failed'],
        );

        AuditService::Record('imported_students', 'Student', null, null, $summary, $request->user(), $request->ip());

        CacheService::invalidate();

        return self::success($message, $summary);
    }

    private static function stripBom(string $value): string
    {
        return str_starts_with($value, "\xEF\xBB\xBF") ? substr($value, 3) : $value;
    }

    /**
     * Rejects CSV uploads whose header set deviates from the template columns.
     *
     * Matching is order-independent: the registrar may reorder the columns.
     *
     * @param  list<string>  $header
     *
     * @throws ValidationException When columns are missing or unexpected.
     */
    private static function validateTemplateColumns(array $header): void
    {
        $present = array_values(array_filter(
            $header,
            static fn (string $name): bool => $name !== '',
        ));

        $missing = array_values(array_diff(StudentImportTemplateHeaders::HEADERS, array_unique($present)));
        $unexpected = array_values(array_unique(array_diff($present, StudentImportTemplateHeaders::HEADERS)));

        if ($missing === [] && $unexpected === []) {
            return;
        }

        $message = 'CSV columns do not match the template.';

        if ($missing !== []) {
            $message .= ' Missing: '.implode(', ', $missing).'.';
        }

        if ($unexpected !== []) {
            $message .= ' Unexpected: '.implode(', ', $unexpected).'.';
        }

        throw ValidationException::withMessages(['file' => $message]);
    }
}
