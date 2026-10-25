<?php

namespace App\Http\Services\SyncRun;

use App\Http\Repository\SyncRunRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\SyncRunResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns one sync run with its row-level errors. */
final class ViewSyncRunService
{
    use ApiResponses;

    public static function ViewSyncRun(Request $request, int $id): JsonResponse
    {
        try {
            $run = (new SyncRunRepository)->findDetailed($id);

            if ($run === null) {
                return self::error('Synchronisation run not found.', 'notFound');
            }

            return self::success(
                'Synchronisation run retrieved successfully.',
                (new SyncRunResource($run))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to retrieve the synchronisation run.');
        }
    }
}
