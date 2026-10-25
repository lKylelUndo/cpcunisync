<?php

namespace App\Http\Controllers;

use App\Http\Services\Source\GetSourceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher that serves raw source datasets. */
class SourceController extends Controller
{
    public static function show(Request $request, string $key): JsonResponse
    {
        return GetSourceService::GetSource($request, $key);
    }
}
