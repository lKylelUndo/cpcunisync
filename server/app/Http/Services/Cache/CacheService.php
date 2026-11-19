<?php

namespace App\Http\Services\Cache;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Thin cache layer: namespaced, versioned keys; cache-first reads that fall
 * back to the database; and best-effort global invalidation on writes.
 */
final class CacheService
{
    private const PREFIX = 'cpc:';

    private const VERSION_KEY = 'cpc:cache:version';

    /** Build the namespaced key, e.g. cpc:registration-options:v0. */
    public static function key(string $name): string
    {
        return self::PREFIX.$name.':v'.self::version();
    }

    /**
     * Cache the callback result, or run the callback directly when the cache
     * store is unavailable so a dead Redis never breaks a request.
     */
    public static function remember(string $name, int $seconds, callable $callback): mixed
    {
        $key = self::key($name);

        try {
            return Cache::remember($key, now()->addSeconds($seconds), $callback);
        } catch (Throwable $exception) {
            Log::warning('Cache read failed; falling back to the database.', [
                'key' => $key,
                'exception' => $exception->getMessage(),
            ]);

            return $callback();
        }
    }

    /** Bump the global version so every cached entry is logically expired. */
    public static function invalidate(): void
    {
        try {
            // Seed the counter so non-Redis stores can increment a missing key.
            Cache::add(self::VERSION_KEY, 0);
            Cache::increment(self::VERSION_KEY);
        } catch (Throwable) {
            // Best effort only: stale entries expire by TTL.
        }
    }

    private static function version(): int
    {
        try {
            return (int) Cache::get(self::VERSION_KEY, 0);
        } catch (Throwable) {
            return 0;
        }
    }
}
