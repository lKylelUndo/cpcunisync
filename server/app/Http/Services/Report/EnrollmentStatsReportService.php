<?php

namespace App\Http\Services\Report;

use App\Http\Repository\ReportRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Builds enrollment statistics grouped by term, program, department and sex. */
final class EnrollmentStatsReportService
{
    use ApiResponses;

    public static function EnrollmentStatsReport(Request $request): JsonResponse
    {
        try {
            $enrollments = (new ReportRepository)->enrollmentsWithStudentContext();

            $byTerm = $enrollments
                ->groupBy(fn ($enrollment) => $enrollment->academic_year.'|'.$enrollment->semester)
                ->map(function ($group): array {
                    $byProgram = $group
                        ->filter(fn ($enrollment) => $enrollment->student?->program !== null)
                        ->groupBy(fn ($enrollment) => $enrollment->student->program_id)
                        ->map(function ($programGroup): array {
                            $program = $programGroup->first()->student->program;

                            return [
                                'code' => $program->code,
                                'name' => $program->name,
                                'count' => $programGroup->count(),
                            ];
                        })
                        ->sortBy('name')
                        ->values()
                        ->all();

                    $byDepartment = $group
                        ->filter(fn ($enrollment) => $enrollment->student?->department !== null)
                        ->groupBy(fn ($enrollment) => $enrollment->student->department_id)
                        ->map(function ($departmentGroup): array {
                            $department = $departmentGroup->first()->student->department;

                            return [
                                'code' => $department->code,
                                'name' => $department->name,
                                'count' => $departmentGroup->count(),
                            ];
                        })
                        ->sortBy('name')
                        ->values()
                        ->all();

                    $first = $group->first();

                    return [
                        'academic_year' => $first->academic_year,
                        'semester' => $first->semester,
                        'total' => $group->count(),
                        'by_program' => $byProgram,
                        'by_department' => $byDepartment,
                    ];
                })
                ->sortBy(fn (array $row) => $row['academic_year'].'-'.self::semesterRank($row['semester']))
                ->values()
                ->all();

            $gender = $enrollments
                ->filter(fn ($enrollment) => $enrollment->student !== null)
                ->groupBy(fn ($enrollment) => $enrollment->student->sex)
                ->map->count();

            return self::success('Enrollment statistics retrieved successfully.', [
                'by_academic_year' => $byTerm,
                'by_gender' => [
                    'male' => (int) ($gender['male'] ?? 0),
                    'female' => (int) ($gender['female'] ?? 0),
                    'other' => (int) ($gender['other'] ?? 0),
                ],
            ]);
        } catch (Throwable) {
            return self::error('Unable to generate enrollment statistics.');
        }
    }

    private static function semesterRank(string $semester): string
    {
        return match ($semester) {
            '1st' => '1',
            '2nd' => '2',
            'summer' => '3',
            default => '4',
        };
    }
}
