<?php

namespace App\Http\Services\Student;

use App\Http\Repository\ProgramRepository;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** Builds the downloadable CSV template that precedes a bulk import. */
final class StudentImportTemplateService
{
    public static function Download(): StreamedResponse
    {
        $programCode = (new ProgramRepository)->all()->first()?->code ?? '';

        return response()->streamDownload(function () use ($programCode): void {
            $output = fopen('php://output', 'wb');

            fputcsv($output, StudentImportTemplateHeaders::HEADERS);
            fputcsv($output, [
                'EXAMPLE-S001',
                'Jane',
                '',
                'Doe',
                'female',
                '1990-05-14',
                'jane.doe@example.com',
                '09123456789',
                '123 Sample Street',
                $programCode,
                '1',
                'active',
            ]);

            fclose($output);
        }, 'students-import-template.csv');
    }
}
