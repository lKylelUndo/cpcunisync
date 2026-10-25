<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminRegistration\RejectUserRequest;
use App\Http\Services\AdminRegistration\GetAllRegistrationsService;
use App\Http\Services\AdminRegistration\RejectUserService;
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
}
