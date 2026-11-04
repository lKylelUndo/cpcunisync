<?php

use App\Http\Controllers\AcademicRecordController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Academic record routes
|--------------------------------------------------------------------------
|
| Authenticated academic record reads with role-gated write operations.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::prefix('academic-records/v1')->group(function (): void {
        Route::get('all-records', [AcademicRecordController::class, 'allRecords']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('create-record', [AcademicRecordController::class, 'createRecord']);
            Route::post('update-record/{id}', [AcademicRecordController::class, 'updateRecord']);
            Route::post('delete-record/{id}', [AcademicRecordController::class, 'deleteRecord']);
        });
    });
});
