<?php

namespace App\Http\Services\Report;

use App\Http\Repository\DepartmentRepository;
use App\Http\Repository\ReportRepository;
use App\Http\Repository\SyncErrorRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Builds sync health, per-department recency and recent error counts. */
final class SyncStatusReportService
{
    use ApiResponses;

    public static function SyncStatusReport(Request $request): JsonResponse
    {
        try {
            $runs = (new ReportRepository)->syncRunsWithDepartmentAndErrorCount();
            $departments = (new DepartmentRepository)->all();

            $byDepartment = $departments
                ->map(function ($department) use ($runs): array {
                    $departmentRuns = $runs
                        ->where('department_id', $department->id)
                        ->sortByDesc('id');
                    $lastRun = $departmentRuns->first();

                    return [
                        'code' => $department->code,
                        'name' => $department->name,
                        'runs' => $departmentRuns->count(),
                        'last_run_status' => $lastRun?->status,
                        'last_run_finished_at' => $lastRun?->finished_at?->toISOString(),
                        'errors_count' => (int) $departmentRuns->sum('sync_errors_count'),
                    ];
                })
                ->values()
                ->all();

            return self::success('Synchronisation status retrieved successfully.', [
                'totals' => [
                    'runs' => $runs->count(),
                    'success' => $runs->where('status', 'success')->count(),
                    'partial' => $runs->where('status', 'partial')->count(),
                    'failed' => $runs->where('status', 'failed')->count(),
                ],
                'by_department' => $byDepartment,
                'recent_errors_count' => (new SyncErrorRepository)->countSince(now()->subDays(7)),
            ]);
        } catch (Throwable) {
            return self::error('Unable to generate the synchronisation status report.');
        }
    }
}
