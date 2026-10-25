<?php

namespace App\Http\Services\Report;

use App\Http\Repository\ReportRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Builds academic outcome summaries across programs and year levels. */
final class AcademicSummaryReportService
{
    use ApiResponses;

    public static function AcademicSummaryReport(Request $request): JsonResponse
    {
        try {
            $records = (new ReportRepository)->academicRecordsWithStudentContext();

            $recorded = $records->count();
            $passed = $records->where('remarks', 'passed')->count();
            $failed = $records->where('remarks', 'failed')->count();
            $incomplete = $records->where('remarks', 'incomplete')->count();
            $ongoing = $records->where('remarks', 'ongoing')->count();

            $byProgram = $records
                ->filter(fn ($record) => $record->student?->program !== null)
                ->groupBy(fn ($record) => $record->student->program_id)
                ->map(function ($group): array {
                    $program = $group->first()->student->program;
                    $graded = $group->filter(fn ($record) => $record->grade !== null);

                    return [
                        'code' => $program->code,
                        'name' => $program->name,
                        'average_grade' => $graded->isEmpty()
                            ? null
                            : round((float) $graded->avg('grade'), 2),
                        'passed' => $group->where('remarks', 'passed')->count(),
                        'failed' => $group->where('remarks', 'failed')->count(),
                        'total' => $group->count(),
                    ];
                })
                ->sortBy('name')
                ->values()
                ->all();

            $byYearLevel = $records
                ->filter(fn ($record) => $record->student !== null)
                ->groupBy(fn ($record) => (int) $record->student->year_level)
                ->map(function ($group, $yearLevel): array {
                    $graded = $group->filter(fn ($record) => $record->grade !== null);

                    return [
                        'year_level' => (int) $yearLevel,
                        'average_grade' => $graded->isEmpty()
                            ? null
                            : round((float) $graded->avg('grade'), 2),
                        'total' => $group->count(),
                    ];
                })
                ->sortBy('year_level')
                ->values()
                ->all();

            return self::success('Academic summary retrieved successfully.', [
                'overall' => [
                    'recorded' => $recorded,
                    'passed' => $passed,
                    'failed' => $failed,
                    'incomplete' => $incomplete,
                    'ongoing' => $ongoing,
                    'pass_rate' => $recorded === 0 ? 0.0 : round(($passed / $recorded) * 100, 2),
                ],
                'by_program' => $byProgram,
                'by_year_level' => $byYearLevel,
            ]);
        } catch (Throwable) {
            return self::error('Unable to generate the academic summary.');
        }
    }
}
