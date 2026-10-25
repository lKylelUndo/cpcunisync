<?php

namespace App\Http\Controllers;

use App\Http\Services\Audit\GetAllAuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for audit log listing. */
class AuditLogController extends Controller
{
    public static function allLogs(Request $request): JsonResponse
    {
        return GetAllAuditService::GetAllAudit($request);
    }
}
