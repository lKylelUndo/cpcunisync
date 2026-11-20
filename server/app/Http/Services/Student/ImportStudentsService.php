<?php

namespace App\Http\Services\Student;

use App\Http\Repository\DepartmentRepository;
use App\Http\Requests\Student\ImportStudentsRequest;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Services\Sync\EtlService;
use App\Http\Services\Sync\RunSyncService;
use App\Models\SourceRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Bulk-imports students from a CSV upload.
 *
 * Rows are validated and persisted as source records in the central MySQL
 * database; a per-source ETL run then loads or updates the students.
 */
final class ImportStudentsService
{
    use ApiResponses;

    private const SOURCE_KEY = 'csv-import';

    /**
     * @return array<string, mixed>
     */
    private static function newSummary(): array
    {
        return [
            'total' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'duplicates' => 0,
            'failed' => 0,
            'errors' => [],
            'sync_runs' => [],
        ];
    }

    public static function Import(ImportStudentsRequest $request): JsonResponse
    {
        $file = $request->file('file');

        $summary = self::newSummary();

        $handle = fopen($file->getRealPath() ?: $file->getPathname(), 'r');

        if ($handle === false) {
            return self::error('The uploaded file could not be read.');
        }

        $queuedKeys = [];

        try {
            $header = fgetcsv($handle);

            if ($header === false) {
                return self::success('Student import completed.', $summary);
            }

            $header = array_map(static fn (mixed $value): string => trim((string) $value), $header);
            $header[0] = self::stripBom($header[0] ?? '');

            self::validateTemplateColumns($header);

            $rowNumber = 1;

            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                $row = array_map(static fn (mixed $value): string => (string) $value, $row);

                if (trim(implode('', $row)) === '') {
                    continue;
                }

                $summary['total']++;

                $payload = [];
                $identifier = '';

                try {
                    foreach ($header as $index => $name) {
                        if ($name !== '') {
                            $payload[$name] = $row[$index] ?? null;
                        }
                    }

                    $identifier = trim((string) ($payload['student_number'] ?? ''));

                    $prepared = EtlService::Transform($payload, self::SOURCE_KEY);

                    $validator = Validator::make($prepared, StudentRules::rules());

                    if ($validator->fails()) {
                        $summary['failed']++;
                        $summary['errors'][] = [
                            'row' => $rowNumber,
                            'identifier' => $identifier,
                            'message' => implode(' ', $validator->errors()->all()),
                            'raw_row' => $row,
                        ];

                        continue;
                    }

                    $sourceKey = self::sourceKeyForDepartment($prepared['department_id']);

                    if ($sourceKey === null) {
                        $summary['failed']++;
                        $summary['errors'][] = [
                            'row' => $rowNumber,
                            'identifier' => $identifier,
                            'message' => 'The department source could not be determined for this row.',
                            'raw_row' => $row,
                        ];

                        continue;
                    }

                    SourceRecord::updateOrCreate(
                        ['source_key' => $sourceKey, 'student_number' => $prepared['student_number']],
                        ['payload' => $payload],
                    );

                    $queuedKeys[$sourceKey] = true;
                } catch (Throwable $exception) {
                    $summary['failed']++;
                    $summary['errors'][] = [
                        'row' => $rowNumber,
                        'identifier' => $identifier,
                        'message' => $exception->getMessage(),
                        'raw_row' => $row,
                    ];
                }
            }
        } finally {
            fclose($handle);
        }

        foreach (array_keys($queuedKeys) as $sourceKey) {
            $response = RunSyncService::RunSync(['department_code' => $sourceKey, 'method' => 'etl']);
            $run = ($response->getData(true)['data'] ?? null);

            if (! is_array($run)) {
                continue;
            }

            $summary['created'] += (int) ($run['loaded'] ?? 0);
            $summary['updated'] += (int) ($run['updated'] ?? 0);
            $summary['skipped'] += (int) ($run['skipped'] ?? 0);
            $summary['duplicates'] += (int) ($run['duplicates'] ?? 0);
            $summary['failed'] += (int) ($run['failed'] ?? 0);

            if (($run['id'] ?? null) !== null) {
                $summary['sync_runs'][] = $run['id'];
            }
        }

        if ($summary['total'] === 0) {
            throw ValidationException::withMessages(['file' => 'CSV contains no student rows.']);
        }

        $message = sprintf(
            '%d rows queued, %d loaded by ETL, %d flagged, %d failed.',
            $summary['total'],
            $summary['created'],
            $summary['duplicates'],
            $summary['failed'],
        );

        AuditService::Record('imported_students', 'Student', null, null, $summary, $request->user(), $request->ip());

        CacheService::invalidate();

        return self::success($message, $summary);
    }

    /**
     * Map the department of a transformed CSV row to its source key.
     */
    private static function sourceKeyForDepartment(?int $departmentId): ?string
    {
        $department = $departmentId !== null
            ? (new DepartmentRepository)->findById($departmentId)
            : null;

        return match ($department?->code) {
            'COE' => 'education',
            'CIT' => 'it',
            'CHM' => 'hospitality',
            default => null,
        };
    }

    private static function stripBom(string $value): string
    {
        return str_starts_with($value, "\xEF\xBB\xBF") ? substr($value, 3) : $value;
    }

    /**
     * Rejects CSV uploads whose header set deviates from the template columns.
     *
     * Matching is order-independent: the registrar may reorder the columns.
     *
     * @param  list<string>  $header
     *
     * @throws ValidationException When columns are missing or unexpected.
     */
    private static function validateTemplateColumns(array $header): void
    {
        $present = array_values(array_filter(
            $header,
            static fn (string $name): bool => $name !== '',
        ));

        $missing = array_values(array_diff(StudentImportTemplateHeaders::HEADERS, array_unique($present)));
        $unexpected = array_values(array_unique(array_diff($present, StudentImportTemplateHeaders::HEADERS)));

        if ($missing === [] && $unexpected === []) {
            return;
        }

        $message = 'CSV columns do not match the template.';

        if ($missing !== []) {
            $message .= ' Missing: '.implode(', ', $missing).'.';
        }

        if ($unexpected !== []) {
            $message .= ' Unexpected: '.implode(', ', $unexpected).'.';
        }

        throw ValidationException::withMessages(['file' => $message]);
    }
}
