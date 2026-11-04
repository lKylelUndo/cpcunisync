<?php

use App\Http\Controllers\IntegrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Integration routes
|--------------------------------------------------------------------------
|
| Authenticated student integration endpoint restricted to staff roles.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::middleware('role:admin,registrar')->group(function (): void {
        Route::post('integration/v1/students', [IntegrationController::class, 'students']);
    });
});
