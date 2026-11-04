<?php

use App\Http\Controllers\EnrollmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Enrollment routes
|--------------------------------------------------------------------------
|
| Authenticated enrollment reads with role-gated write operations.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::prefix('enrollments/v1')->group(function (): void {
        Route::get('all-enrollments', [EnrollmentController::class, 'allEnrollments']);
        Route::get('view-enrollment/{id}', [EnrollmentController::class, 'viewEnrollment']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('create-enrollment', [EnrollmentController::class, 'createEnrollment']);
            Route::post('update-enrollment/{id}', [EnrollmentController::class, 'updateEnrollment']);
            Route::post('delete-enrollment/{id}', [EnrollmentController::class, 'deleteEnrollment']);
        });
    });
});
