<?php

namespace App\Console\Commands;

use App\Http\Services\Sync\RunSyncService;
use Illuminate\Console\Command;

/** Runs the student ETL synchronisation from the console, without an HTTP server. */
class SyncStudents extends Command
{
    protected $signature = 'sync:students
        {--department= : Source to sync: education, it or hospitality}';

    protected $description = 'Synchronise student records from the configured department sources.';

    public function handle(): int
    {
        $department = $this->option('department');

        if ($department !== null && ! in_array($department, ['education', 'it', 'hospitality'], true)) {
            $this->error('Unknown department source. Use education, it or hospitality.');

            return self::FAILURE;
        }

        $response = RunSyncService::RunSync([
            'department_code' => $department,
        ]);
        $payload = $response->getData(true);

        if (($payload['status'] ?? 'error') !== 'success') {
            $this->error((string) ($payload['message'] ?? 'Synchronisation failed.'));

            return self::FAILURE;
        }

        $run = $payload['data'] ?? [];

        $this->info(sprintf(
            'Sync #%s finished with status %s.',
            $run['id'] ?? '-',
            $run['status'] ?? '-',
        ));

        $this->table(
            ['Extracted', 'Loaded', 'Updated', 'Skipped', 'Duplicates', 'Failed'],
            [[
                $run['extracted'] ?? 0,
                $run['loaded'] ?? 0,
                $run['updated'] ?? 0,
                $run['skipped'] ?? 0,
                $run['duplicates'] ?? 0,
                $run['failed'] ?? 0,
            ]],
        );

        foreach (($run['sync_errors'] ?? []) as $error) {
            $this->warn(sprintf(
                '%s: %s',
                $error['row_identifier'] ?? 'row',
                $error['message'] ?? 'Unknown error',
            ));
        }

        return self::SUCCESS;
    }
}
