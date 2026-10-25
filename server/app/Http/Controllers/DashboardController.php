<?php

namespace App\Http\Controllers;

use App\Http\Services\Dashboard\ViewDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for the dashboard overview. */
class DashboardController extends Controller
{
    public static function index(Request $request): JsonResponse
    {
        return ViewDashboardService::ViewDashboard($request);
    }
}
