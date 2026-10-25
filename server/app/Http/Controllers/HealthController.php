<?php

namespace App\Http\Controllers;

use App\Http\Services\Health\CheckHealthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for the API health endpoint. */
class HealthController extends Controller
{
    public static function health(Request $request): JsonResponse
    {
        return CheckHealthService::CheckHealth($request);
    }
}
