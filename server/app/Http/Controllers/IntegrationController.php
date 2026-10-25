<?php

namespace App\Http\Controllers;

use App\Http\Requests\Integration\StoreIntegrationStudentRequest;
use App\Http\Services\Integration\PostIntegrationStudentService;
use Illuminate\Http\JsonResponse;

/** Thin dispatcher for the REST student integration endpoint. */
class IntegrationController extends Controller
{
    public static function students(StoreIntegrationStudentRequest $request): JsonResponse
    {
        return PostIntegrationStudentService::PostIntegrationStudent($request);
    }
}
