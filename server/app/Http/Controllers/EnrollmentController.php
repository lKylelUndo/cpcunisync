<?php

namespace App\Http\Controllers;

use App\Http\Requests\Enrollment\StoreEnrollmentRequest;
use App\Http\Requests\Enrollment\UpdateEnrollmentRequest;
use App\Http\Services\Enrollment\DeleteEnrollmentService;
use App\Http\Services\Enrollment\GetAllEnrollmentService;
use App\Http\Services\Enrollment\PostEnrollmentService;
use App\Http\Services\Enrollment\UpdateEnrollmentService;
use App\Http\Services\Enrollment\ViewEnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for enrollment endpoints. */
class EnrollmentController extends Controller
{
    public static function allEnrollments(Request $request): JsonResponse
    {
        return GetAllEnrollmentService::GetAllEnrollment($request);
    }

    public static function viewEnrollment(Request $request, int $id): JsonResponse
    {
        return ViewEnrollmentService::ViewEnrollment($request, $id);
    }

    public static function createEnrollment(StoreEnrollmentRequest $request): JsonResponse
    {
        return PostEnrollmentService::PostEnrollment($request);
    }

    public static function updateEnrollment(UpdateEnrollmentRequest $request, int $id): JsonResponse
    {
        return UpdateEnrollmentService::UpdateEnrollment($request, $id);
    }

    public static function deleteEnrollment(Request $request, int $id): JsonResponse
    {
        return DeleteEnrollmentService::DeleteEnrollment($request, $id);
    }
}
