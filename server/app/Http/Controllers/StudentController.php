<?php

namespace App\Http\Controllers;

use App\Http\Requests\Student\ImportStudentsRequest;
use App\Http\Requests\Student\MergeStudentRequest;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Services\Student\DeleteStudentService;
use App\Http\Services\Student\DismissStudentService;
use App\Http\Services\Student\GetAllStudentService;
use App\Http\Services\Student\ImportStudentsService;
use App\Http\Services\Student\MergeStudentService;
use App\Http\Services\Student\PostStudentService;
use App\Http\Services\Student\StudentImportTemplateService;
use App\Http\Services\Student\UpdateStudentService;
use App\Http\Services\Student\ViewAllDuplicatesService;
use App\Http\Services\Student\ViewStudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Thin dispatcher for student and duplicate-management endpoints. */
class StudentController extends Controller
{
    public static function allStudents(Request $request): JsonResponse
    {
        return GetAllStudentService::GetAllStudent($request);
    }

    public static function duplicates(Request $request): JsonResponse
    {
        return ViewAllDuplicatesService::ViewAllDuplicates($request);
    }

    public static function viewStudent(Request $request, int $id): JsonResponse
    {
        return ViewStudentService::ViewStudent($request, $id);
    }

    public static function createStudent(StoreStudentRequest $request): JsonResponse
    {
        return PostStudentService::PostStudent($request);
    }

    public static function updateStudent(UpdateStudentRequest $request, int $id): JsonResponse
    {
        return UpdateStudentService::UpdateStudent($request, $id);
    }

    public static function deleteStudent(Request $request, int $id): JsonResponse
    {
        return DeleteStudentService::DeleteStudent($request, $id);
    }

    public static function mergeStudent(MergeStudentRequest $request, int $id): JsonResponse
    {
        return MergeStudentService::MergeStudent($request, $id);
    }

    public static function dismissDuplicate(Request $request, int $id): JsonResponse
    {
        return DismissStudentService::DismissStudent($request, $id);
    }

    public static function importStudents(ImportStudentsRequest $request): JsonResponse
    {
        return ImportStudentsService::Import($request);
    }

    public static function importTemplate(): StreamedResponse
    {
        return StudentImportTemplateService::Download();
    }
}
