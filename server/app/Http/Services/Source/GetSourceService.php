<?php

namespace App\Http\Services\Source;

use App\Http\Repository\SourceRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Serves a raw local source dataset for ETL and integration demos. */
final class GetSourceService
{
    public static function GetSource(Request $request, string $key): JsonResponse
    {
        try {
            $repository = new SourceRepository;

            if (! $repository->exists($key)) {
                return self::notFound();
            }

            $payload = $repository->readFile($key);

            if ($payload === null) {
                return self::notFound();
            }

            return response()->json($payload);
        } catch (Throwable) {
            return self::notFound();
        }
    }

    private static function notFound(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Source not found.',
            'source' => 'notFound',
        ], 404);
    }
}
