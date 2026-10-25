<?php

namespace App\Http\Services\AcademicRecord;

use App\Http\Repository\AcademicRecordRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Deletes an academic record. */
final class DeleteAcademicRecordService
{
    use ApiResponses;

    public static function DeleteAcademicRecord(Request $request, int $id): JsonResponse
    {
        try {
            $repository = new AcademicRecordRepository;
            $record = $repository->findById($id);

            if ($record === null) {
                return self::error('Academic record not found.', 'notFound');
            }

            $repository->delete($record);

            return self::success('Academic record deleted successfully.', ['id' => $id]);
        } catch (Throwable) {
            return self::error('Unable to delete the academic record.');
        }
    }
}
