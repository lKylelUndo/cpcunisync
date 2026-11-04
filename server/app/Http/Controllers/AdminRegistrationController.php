<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminRegistration\RejectUserRequest;
use App\Http\Services\AdminRegistration\DeleteUserService;
use App\Http\Services\AdminRegistration\GetAllRegistrationsService;
use App\Http\Services\AdminRegistration\ReinstateUserService;
use App\Http\Services\AdminRegistration\RejectUserService;
use App\Http\Services\AdminRegistration\SuspendUserService;
use App\Http\Services\AdminRegistration\VerifyUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for administrator registration-review endpoints. */
class AdminRegistrationController extends Controller
{
    public static function allRegistrations(Request $request): JsonResponse
    {
        return GetAllRegistrationsService::GetAllRegistrations($request);
    }

    public static function verifyUser(Request $request, int $id): JsonResponse
    {
        return VerifyUserService::VerifyUser($request, $id);
    }

    public static function rejectUser(RejectUserRequest $request, int $id): JsonResponse
    {
        return RejectUserService::RejectUser($request, $id);
    }

    public static function suspendUser(Request $request, int $id): JsonResponse
    {
        return SuspendUserService::SuspendUser($request, $id);
    }

    public static function reinstateUser(Request $request, int $id): JsonResponse
    {
        return ReinstateUserService::ReinstateUser($request, $id);
    }

    public static function deleteUser(Request $request, int $id): JsonResponse
    {
        return DeleteUserService::DeleteUser($request, $id);
    }
}
