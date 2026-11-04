<?php

use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Student routes
|--------------------------------------------------------------------------
|
| Authenticated student reads with role-gated write operations.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::prefix('students/v1')->group(function (): void {
        Route::get('all-students', [StudentController::class, 'allStudents']);
        Route::get('duplicates', [StudentController::class, 'duplicates']);
        Route::get('view-student/{id}', [StudentController::class, 'viewStudent']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('create-student', [StudentController::class, 'createStudent']);
            Route::post('update-student/{id}', [StudentController::class, 'updateStudent']);
            Route::post('delete-student/{id}', [StudentController::class, 'deleteStudent']);
            Route::post('merge-student/{id}', [StudentController::class, 'mergeStudent']);
            Route::post('dismiss-duplicate/{id}', [StudentController::class, 'dismissDuplicate']);
        });
    });
});
