<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sync\RunSyncRequest;
use App\Http\Services\Sync\RunSyncService;
use App\Http\Services\SyncRun\GetAllSyncRunService;
use App\Http\Services\SyncRun\ViewSyncRunService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Thin dispatcher for synchronisation endpoints. */
class SyncController extends Controller
{
    public static function allRuns(Request $request): JsonResponse
    {
        return GetAllSyncRunService::GetAllSyncRun($request);
    }

    public static function viewRun(Request $request, int $id): JsonResponse
    {
        return ViewSyncRunService::ViewSyncRun($request, $id);
    }

    public static function run(RunSyncRequest $request): JsonResponse
    {
        return RunSyncService::RunSync($request);
    }
}
