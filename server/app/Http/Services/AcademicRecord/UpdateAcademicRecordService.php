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

/** Updates an academic record after validating student/enrollment ownership. */
final class UpdateAcademicRecordService
{
    use ApiResponses;

    public static function UpdateAcademicRecord(Request $request, int $id): JsonResponse
    {
        $data = $request->validated();

        try {
            $repository = new AcademicRecordRepository;
            $record = $repository->findById($id);

            if ($record === null) {
                return self::error('Academic record not found.', 'notFound');
            }

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

            $record = $repository->update($record, $data);
            $record->load(['student.program.department', 'student.department', 'enrollment']);

            return self::success(
                'Academic record updated successfully.',
                (new AcademicRecordResource($record))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to update the academic record.');
        }
    }
}
