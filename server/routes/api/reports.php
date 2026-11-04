<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Report routes
|--------------------------------------------------------------------------
|
| Authenticated enrollment, academic and sync status reports.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::prefix('reports/v1')->group(function (): void {
        Route::get('enrollment-stats', [ReportController::class, 'enrollmentStats']);
        Route::get('academic-summary', [ReportController::class, 'academicSummary']);
        Route::get('sync-status', [ReportController::class, 'syncStatus']);
    });
});
