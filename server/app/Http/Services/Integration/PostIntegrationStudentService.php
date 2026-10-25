<?php

namespace App\Http\Services\Integration;

use App\Http\Repository\ProgramRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Repository\SyncRunRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Services\Student\DuplicateDetectionService;
use App\Http\Resources\StudentResource;
use App\Models\Program;
use App\Models\Student;
use App\Models\SyncRun;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Receives a student from an external REST source and records the push as a sync run. */
final class PostIntegrationStudentService
{
    use ApiResponses;

    public static function PostIntegrationStudent(Request $request): JsonResponse
    {
        $data = $request->validated();

        $runs = new SyncRunRepository;

        try {
            $run = $runs->create([
                'department_id' => null,
                'method' => 'rest',
                'status' => 'running',
                'extracted' => 1,
                'started_at' => now(),
            ]);
        } catch (Throwable) {
            return self::error('Unable to start the integration request.');
        }

        try {
            $program = self::resolveProgram($data);

            if ($program === null) {
                self::finishRun($runs, $run, 'failed', [
                    'failed' => 1,
                    'message' => 'The program could not be resolved.',
                ]);

                return self::error('The selected program is invalid.', 'notValid');
            }

            $run->department_id = $program->department_id;
            $run = $runs->update($run, ['department_id' => $program->department_id]);

            $students = new StudentRepository;
            $payload = self::studentPayload($data, $program);

            $existing = $students->findByStudentNumber($payload['student_number']);

            if ($existing !== null) {
                $existing = $students->update($existing, $payload);
                $existing->load(['program.department', 'department']);
                self::finishRun($runs, $run, 'success', [
                    'updated' => 1,
                    'message' => 'REST integration updated an existing student.',
                ]);

                return self::successWithSource(
                    'Student record updated.',
                    'updated',
                    ['student' => (new StudentResource($existing))->resolve()],
                );
            }

            $candidate = DuplicateDetectionService::FindCandidates($payload);

            if ($candidate !== null) {
                $candidateModels = $students->findCandidates($payload)
                    ->map(fn (Student $match) => [
                        'student' => (new StudentResource($match))->resolve(),
                        'match_reason' => DuplicateDetectionService::MatchReason($match, $payload),
                    ])
                    ->filter(fn (array $match) => $match['match_reason'] !== null)
                    ->values()
                    ->all();

                $student = $students->create([
                    ...$payload,
                    'integrity_status' => 'duplicate_suspect',
                    'duplicate_of_id' => $candidate['student']->id,
                ]);
                $student->load(['program.department', 'department']);

                self::finishRun($runs, $run, 'success', [
                    'duplicates' => 1,
                    'message' => 'REST integration inserted a duplicate suspect.',
                ]);

                return self::error('Potential duplicate detected', 'duplicate', [
                    'student' => (new StudentResource($student))->resolve(),
                    'candidates' => $candidateModels,
                ]);
            }

            $student = $students->create([
                ...$payload,
                'integrity_status' => 'clean',
                'duplicate_of_id' => null,
            ]);
            $student->load(['program.department', 'department']);

            self::finishRun($runs, $run, 'success', [
                'loaded' => 1,
                'message' => 'REST integration created a new student.',
            ]);

            return self::successWithSource(
                'Student record created.',
                'created',
                ['student' => (new StudentResource($student))->resolve()],
            );
        } catch (Throwable) {
            self::finishRun($runs, $run, 'failed', [
                'failed' => 1,
                'message' => 'The integration request could not be processed.',
            ]);

            return self::error('Unable to process the integration request.');
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function resolveProgram(array $data): ?Program
    {
        $programs = new ProgramRepository;

        if (! empty($data['program_id'])) {
            return $programs->findByIdBasic((int) $data['program_id']);
        }

        return $programs->findByCode((string) ($data['program_code'] ?? ''));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function studentPayload(array $data, Program $program): array
    {
        unset($data['program_code']);

        return [
            ...$data,
            'student_number' => trim((string) $data['student_number']),
            'program_id' => $program->id,
            'department_id' => $program->department_id,
            'year_level' => $data['year_level'] ?? 1,
            'status' => $data['status'] ?? 'active',
            'source' => 'rest',
        ];
    }

    /**
     * @param  array<string, mixed>  $counters
     */
    private static function finishRun(SyncRunRepository $runs, SyncRun $run, string $status, array $counters): void
    {
        try {
            $runs->update($run, [
                ...$counters,
                'status' => $status,
                'finished_at' => now(),
            ]);
        } catch (Throwable) {
            // The integration response remains the authoritative result.
        }
    }
}
