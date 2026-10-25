<?php

namespace App\Http\Controllers;

use App\Http\Services\Registration\GetRegistrationOptionsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for public registration lookups. */
class RegistrationController extends Controller
{
    public static function options(Request $request): JsonResponse
    {
        return GetRegistrationOptionsService::GetRegistrationOptions($request);
    }
}
