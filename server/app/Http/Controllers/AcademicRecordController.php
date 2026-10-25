<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcademicRecord\StoreAcademicRecordRequest;
use App\Http\Requests\AcademicRecord\UpdateAcademicRecordRequest;
use App\Http\Services\AcademicRecord\DeleteAcademicRecordService;
use App\Http\Services\AcademicRecord\GetAllAcademicRecordService;
use App\Http\Services\AcademicRecord\PostAcademicRecordService;
use App\Http\Services\AcademicRecord\UpdateAcademicRecordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for academic record endpoints. */
class AcademicRecordController extends Controller
{
    public static function allRecords(Request $request): JsonResponse
    {
        return GetAllAcademicRecordService::GetAllAcademicRecord($request);
    }

    public static function createRecord(StoreAcademicRecordRequest $request): JsonResponse
    {
        return PostAcademicRecordService::PostAcademicRecord($request);
    }

    public static function updateRecord(UpdateAcademicRecordRequest $request, int $id): JsonResponse
    {
        return UpdateAcademicRecordService::UpdateAcademicRecord($request, $id);
    }

    public static function deleteRecord(Request $request, int $id): JsonResponse
    {
        return DeleteAcademicRecordService::DeleteAcademicRecord($request, $id);
    }
}
