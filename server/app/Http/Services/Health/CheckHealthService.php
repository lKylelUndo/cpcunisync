<?php

namespace App\Http\Services\Health;

use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Lightweight public health check for the API surface. */
final class CheckHealthService
{
    use ApiResponses;

    public static function CheckHealth(Request $request): JsonResponse
    {
        return self::success('CPC UniSync API is healthy.', [
            'service' => 'cpcunisync-api',
            'timestamp' => now()->toISOString(),
        ]);
    }
}
