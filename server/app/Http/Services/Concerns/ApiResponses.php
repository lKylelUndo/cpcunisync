<?php

namespace App\Http\Services\Concerns;

use Illuminate\Http\JsonResponse;

/** Shared flat response envelope helpers for API services. */
trait ApiResponses
{
    /**
     * @param  array<string, mixed>  $data
     */
    protected static function success(string $message, array $data = []): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected static function successWithSource(string $message, string $source, array $data = []): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'source' => $source,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected static function error(string $message, string $source = 'error', array $data = []): JsonResponse
    {
        $payload = [
            'status' => 'error',
            'message' => $message,
            'source' => $source,
        ];

        if ($data !== []) {
            $payload['data'] = $data;
        }

        return response()->json($payload);
    }
}
