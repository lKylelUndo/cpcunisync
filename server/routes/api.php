<?php

/*
|--------------------------------------------------------------------------
| CPC UniSync API routes
|--------------------------------------------------------------------------
|
| Domain groups are versioned independently; all API actions dispatch to
| thin controllers backed by operation services and repositories.
|
| Domain route files are required in registration order below.
|
*/

require __DIR__.'/api/auth.php';
require __DIR__.'/api/public.php';
require __DIR__.'/api/dashboard.php';
require __DIR__.'/api/lookup.php';
require __DIR__.'/api/students.php';
require __DIR__.'/api/enrollments.php';
require __DIR__.'/api/academic-records.php';
require __DIR__.'/api/audit-logs.php';
require __DIR__.'/api/sync.php';
require __DIR__.'/api/integration.php';
require __DIR__.'/api/reports.php';
require __DIR__.'/api/registrations.php';
