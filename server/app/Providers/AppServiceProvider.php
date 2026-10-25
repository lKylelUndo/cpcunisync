<?php

namespace App\Providers;

use App\Models\AcademicRecord;
use App\Models\Enrollment;
use App\Models\Student;
use App\Observers\WritesAuditLogs;
use Illuminate\Support\ServiceProvider;

/** Application-wide model observers and service bindings. */
class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Student::observe(WritesAuditLogs::class);
        Enrollment::observe(WritesAuditLogs::class);
        AcademicRecord::observe(WritesAuditLogs::class);
    }
}
