<?php

namespace App\Http\Services\Dashboard;

use App\Http\Repository\DashboardRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Builds the registrar dashboard overview from aggregate collections. */
final class ViewDashboardService
{
    use ApiResponses;

    public static function ViewDashboard(Request $request): JsonResponse
    {
        try {
            $repository = new DashboardRepository;
            $students = $repository->allStudents();
            $runs = $repository->allSyncRuns();
            $latestRun = $repository->latestSyncRun();

            $statuses = $students->groupBy('status')->map->count();
            $genders = $students->groupBy('sex')->map->count();
            $runStatuses = $runs->groupBy('status')->map->count();

            $byDepartment = $students
                ->filter(fn ($student) => $student->department !== null)
                ->groupBy('department_id')
                ->map(function ($group): array {
                    $department = $group->first()->department;

                    return [
                        'code' => $department->code,
                        'name' => $department->name,
                        'count' => $group->count(),
                    ];
                })
                ->sortBy('name')
                ->values()
                ->all();

            $byProgram = $students
                ->filter(fn ($student) => $student->program !== null)
                ->groupBy('program_id')
                ->map(function ($group): array {
                    $program = $group->first()->program;

                    return [
                        'code' => $program->code,
                        'name' => $program->name,
                        'count' => $group->count(),
                    ];
                })
                ->sortBy('name')
                ->values()
                ->all();

            $lastSync = $latestRun === null ? null : [
                'id' => $latestRun->id,
                'department_code' => $latestRun->department?->code,
                'department_name' => $latestRun->department?->name,
                'method' => $latestRun->method,
                'status' => $latestRun->status,
                'finished_at' => $latestRun->finished_at?->toISOString(),
                'loaded' => $latestRun->loaded,
            ];

            return self::success('Dashboard retrieved successfully.', [
                'students_total' => $students->count(),
                'students_by_status' => [
                    'active' => (int) ($statuses['active'] ?? 0),
                    'inactive' => (int) ($statuses['inactive'] ?? 0),
                    'graduated' => (int) ($statuses['graduated'] ?? 0),
                    'dropped' => (int) ($statuses['dropped'] ?? 0),
                ],
                'active_enrollments' => $repository->countActiveEnrollments(),
                'gender' => [
                    'male' => (int) ($genders['male'] ?? 0),
                    'female' => (int) ($genders['female'] ?? 0),
                    'other' => (int) ($genders['other'] ?? 0),
                ],
                'duplicates_count' => $students->where('integrity_status', 'duplicate_suspect')->count(),
                'department_breakdown' => $byDepartment,
                'program_breakdown' => $byProgram,
                'last_sync' => $lastSync,
                'sync_health' => [
                    'running' => (int) ($runStatuses['running'] ?? 0),
                    'success' => (int) ($runStatuses['success'] ?? 0),
                    'partial' => (int) ($runStatuses['partial'] ?? 0),
                    'failed' => (int) ($runStatuses['failed'] ?? 0),
                ],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve the dashboard.');
        }
    }
}
