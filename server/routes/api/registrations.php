<?php

use App\Http\Controllers\AdminRegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Registration administration routes
|--------------------------------------------------------------------------
|
| Administrator-only staff registration review and account management.
|
*/

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin/v1')
    ->group(function (): void {
        Route::get('all-registrations', [AdminRegistrationController::class, 'allRegistrations']);
        Route::post('verify-user/{id}', [AdminRegistrationController::class, 'verifyUser']);
        Route::post('reject-user/{id}', [AdminRegistrationController::class, 'rejectUser']);
        Route::post('suspend-user/{id}', [AdminRegistrationController::class, 'suspendUser']);
        Route::post('reinstate-user/{id}', [AdminRegistrationController::class, 'reinstateUser']);
        Route::post('delete-user/{id}', [AdminRegistrationController::class, 'deleteUser']);
    });
