<?php

use App\Http\Controllers\AcademicRecordController;
use App\Http\Controllers\AdminRegistrationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\LookupController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SourceController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| CPC UniSync API routes
|--------------------------------------------------------------------------
|
| Domain groups are versioned independently; all API actions dispatch to
| thin controllers backed by operation services and repositories.
|
*/

Route::get('health', [HealthController::class, 'health']);
Route::get('sources/{key}', [SourceController::class, 'show']);

Route::prefix('auth/v1')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::prefix('registration/v1')->group(function (): void {
    Route::get('options', [RegistrationController::class, 'options']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('departments', [LookupController::class, 'departments']);
    Route::get('programs', [LookupController::class, 'programs']);

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

    Route::prefix('enrollments/v1')->group(function (): void {
        Route::get('all-enrollments', [EnrollmentController::class, 'allEnrollments']);
        Route::get('view-enrollment/{id}', [EnrollmentController::class, 'viewEnrollment']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('create-enrollment', [EnrollmentController::class, 'createEnrollment']);
            Route::post('update-enrollment/{id}', [EnrollmentController::class, 'updateEnrollment']);
            Route::post('delete-enrollment/{id}', [EnrollmentController::class, 'deleteEnrollment']);
        });
    });

    Route::prefix('academic-records/v1')->group(function (): void {
        Route::get('all-records', [AcademicRecordController::class, 'allRecords']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('create-record', [AcademicRecordController::class, 'createRecord']);
            Route::post('update-record/{id}', [AcademicRecordController::class, 'updateRecord']);
            Route::post('delete-record/{id}', [AcademicRecordController::class, 'deleteRecord']);
        });
    });

    Route::get('audit-logs/v1/all-logs', [AuditLogController::class, 'allLogs']);

    Route::prefix('sync/v1')->group(function (): void {
        Route::get('all-runs', [SyncController::class, 'allRuns']);
        Route::get('view-run/{id}', [SyncController::class, 'viewRun']);

        Route::middleware('role:admin,registrar')->group(function (): void {
            Route::post('run', [SyncController::class, 'run']);
        });
    });

    Route::middleware('role:admin,registrar')->group(function (): void {
        Route::post('integration/v1/students', [IntegrationController::class, 'students']);
    });

    Route::prefix('reports/v1')->group(function (): void {
        Route::get('enrollment-stats', [ReportController::class, 'enrollmentStats']);
        Route::get('academic-summary', [ReportController::class, 'academicSummary']);
        Route::get('sync-status', [ReportController::class, 'syncStatus']);
    });
});

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/v1')
    ->group(function (): void {
        Route::get('all-registrations', [AdminRegistrationController::class, 'allRegistrations']);
        Route::post('verify-user/{id}', [AdminRegistrationController::class, 'verifyUser']);
        Route::post('reject-user/{id}', [AdminRegistrationController::class, 'rejectUser']);
    });
