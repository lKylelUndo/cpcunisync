<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\SourceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
|
| Unauthenticated health, source metadata and registration lookup endpoints.
|
*/

Route::get('health', [HealthController::class, 'health']);
Route::get('sources/{key}', [SourceController::class, 'show']);

Route::prefix('registration/v1')->group(function (): void {
    Route::get('options', [RegistrationController::class, 'options']);
});
