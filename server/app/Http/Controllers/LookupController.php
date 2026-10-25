<?php

namespace App\Http\Controllers;

use App\Http\Services\Lookup\GetAllDepartmentService;
use App\Http\Services\Lookup\GetAllProgramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for department and program lookups. */
class LookupController extends Controller
{
    public static function departments(Request $request): JsonResponse
    {
        return GetAllDepartmentService::GetAllDepartment($request);
    }

    public static function programs(Request $request): JsonResponse
    {
        return GetAllProgramService::GetAllProgram($request);
    }
}
