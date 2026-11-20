<?php

namespace App\Http\Repository;

use Illuminate\Support\Facades\File;
use RuntimeException;

/** Reads local JSON source files. */
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

    public function exists(string $key): bool
    {
        return in_array($key, self::KEYS, true) && File::exists($this->pathFor($key));
    }

    public function pathFor(string $key): string
    {
        return database_path("sources/{$key}.json");
    }
}
