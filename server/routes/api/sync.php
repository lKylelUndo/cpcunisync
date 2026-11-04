<?php

use App\Http\Controllers\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Sync routes
|--------------------------------------------------------------------------
|
| Authenticated sync run reads with a role-gated run trigger.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::prefix('sync/v1')->group(function (): void {
        Route::get('all-runs', [SyncController::class, 'allRuns']);
        Route::get('view-run/{id}', [SyncController::class, 'viewRun']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('run', [SyncController::class, 'run']);
        });
    });
});
