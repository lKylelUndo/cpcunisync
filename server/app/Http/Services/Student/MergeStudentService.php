<?php

namespace App\Http\Services\Student;

use App\Http\Repository\AcademicRecordRepository;
use App\Http\Repository\EnrollmentRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Merges a duplicate suspect into a primary student and re-parents child records. */
final class MergeStudentService
{
    use ApiResponses;

    public static function MergeStudent(Request $request, int $id): JsonResponse
    {
        $data = $request->validated();

        if ((int) $data['duplicate_id'] === $id) {
            return self::error('The duplicate record must be different from the primary student.', 'invalidDuplicate');
        }

        try {
            $students = new StudentRepository;
            $enrollments = new EnrollmentRepository;
            $records = new AcademicRecordRepository;

            $primary = $students->findById($id);
            $suspect = $students->findById((int) $data['duplicate_id']);

            if ($primary === null || $suspect === null) {
                return self::error('The selected student record was not found.', 'notFound');
            }

            if ((int) $suspect->duplicate_of_id !== (int) $primary->id) {
                return self::error(
                    'The selected record is not a duplicate of this student.',
                    'invalidDuplicate',
                );
            }

            $moved = $students->transaction(function () use ($students, $primary, $suspect, $enrollments, $records): array {
                $movedEnrollments = 0;
                $movedRecords = 0;

                foreach ($enrollments->allForStudent($suspect->id) as $enrollment) {
                    $conflict = $enrollments->findForTerm(
                        $primary->id,
                        $enrollment->academic_year,
                        $enrollment->semester,
                    );

                    if ($conflict === null) {
                        $enrollments->moveToStudent($enrollment, $primary->id);
                        $movedEnrollments++;
                    }
                }

                foreach ($records->allForStudent($suspect->id) as $record) {
                    $conflict = $records->findForTermSubject(
                        $primary->id,
                        $record->subject_code,
                        $record->academic_year,
                        $record->semester,
                    );

                    if ($conflict === null) {
                        $records->moveToStudent($record, $primary->id);
                        $movedRecords++;
                    }
                }

                $students->delete($suspect);

                return [
                    'enrollments_moved' => $movedEnrollments,
                    'academic_records_moved' => $movedRecords,
                ];
            });

            AuditService::Record(
                'merged_duplicate',
                'Student',
                $primary->id,
                ['duplicate_id' => $suspect->id],
                [
                    'primary_id' => $primary->id,
                    'merged_duplicate_id' => $suspect->id,
                    ...$moved,
                ],
                null,
                $request->ip(),
            );

            $primary = $students->findDetailed($primary->id);

            if ($primary === null) {
                return self::error('Unable to reload the merged student record.');
            }

            return self::success(
                'Duplicate student merged successfully.',
                (new StudentResource($primary))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to merge the duplicate student.');
        }
    }
}
