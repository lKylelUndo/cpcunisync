<?php

namespace App\Http\Repository;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/** Reads local JSON source files or the optional REST source endpoint. */
class SourceRepository
{
    public const KEYS = ['education', 'it', 'hospitality'];

    /**
     * @return array<string, mixed>|null
     */
    public function readFile(string $key): ?array
    {
        $path = $this->pathFor($key);

        if (! File::exists($path)) {
            return null;
        }

        $contents = File::get($path);
        $payload = json_decode($contents, true);

        if (! is_array($payload)) {
            throw new RuntimeException('The source file contains invalid JSON.');
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public function fetchRemote(string $key): array
    {
        $baseUrl = rtrim((string) env('SOURCE_API_BASE_URL', 'http://127.0.0.1:8000'), '/');

        $response = Http::acceptJson()->timeout(20)->get("{$baseUrl}/api/sources/{$key}");
        $response->throw();

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new RuntimeException('The source endpoint returned an invalid payload.');
        }

        return $payload;
    }

    public function exists(string $key): bool
    {
        return in_array($key, self::KEYS, true) && File::exists($this->pathFor($key));
    }

    public function pathFor(string $key): string
    {
        return database_path("sources/{$key}.json");
    }
}
