<?php

namespace App\Http\Services\AcademicRecord;

use App\Http\Repository\AcademicRecordRepository;
use App\Http\Repository\EnrollmentRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\AcademicRecordResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Creates an academic record linked to a valid student and enrollment. */
final class PostAcademicRecordService
{
    use ApiResponses;

    public static function PostAcademicRecord(Request $request): JsonResponse
    {
        $data = $request->validated();

        try {
            if ((new StudentRepository)->findById((int) $data['student_id']) === null) {
                return self::error('The selected student was not found.', 'notValid');
            }

            if (! empty($data['enrollment_id'])) {
                $enrollment = (new EnrollmentRepository)->findById((int) $data['enrollment_id']);

                if ($enrollment === null || (int) $enrollment->student_id !== (int) $data['student_id']) {
                    return self::error(
                        'The enrollment does not belong to the selected student.',
                        'invalidEnrollment',
                    );
                }
            }

            $record = (new AcademicRecordRepository)->create($data);
            $record->load(['student.program.department', 'student.department', 'enrollment']);

            return self::success(
                'Academic record created successfully.',
                (new AcademicRecordResource($record))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to create the academic record.');
        }
    }
}
