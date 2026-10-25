<?php

namespace App\Http\Controllers;

use App\Http\Services\Report\AcademicSummaryReportService;
use App\Http\Services\Report\EnrollmentStatsReportService;
use App\Http\Services\Report\SyncStatusReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for reporting endpoints. */
class ReportController extends Controller
{
    public static function enrollmentStats(Request $request): JsonResponse
    {
        return EnrollmentStatsReportService::EnrollmentStatsReport($request);
    }

    public static function academicSummary(Request $request): JsonResponse
    {
        return AcademicSummaryReportService::AcademicSummaryReport($request);
    }

    public static function syncStatus(Request $request): JsonResponse
    {
        return SyncStatusReportService::SyncStatusReport($request);
    }
}
