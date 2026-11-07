<?php

use App\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Audit log routes
|--------------------------------------------------------------------------
|
| Authenticated audit trail read endpoint.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('audit-logs/v1/all-logs', [AuditLogController::class, 'allLogs'])
        ->middleware('role:admin,registrar');
});
