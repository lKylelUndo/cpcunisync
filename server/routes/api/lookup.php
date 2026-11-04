<?php

use App\Http\Controllers\LookupController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Lookup routes
|--------------------------------------------------------------------------
|
| Authenticated department and program lookup endpoints.
|
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('departments', [LookupController::class, 'departments']);
    Route::get('programs', [LookupController::class, 'programs']);
});
