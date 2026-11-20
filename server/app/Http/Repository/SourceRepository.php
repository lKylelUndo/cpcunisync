<?php

namespace App\Http\Repository;

use App\Models\SourceRecord;
use Illuminate\Support\Facades\File;
use RuntimeException;

/** Reads local JSON source files, merging in persisted source rows. */
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

        $records = $payload['records'] ?? [];

        if (! is_array($records)) {
            $records = [];
        }

        $payload['records'] = array_merge(
            $records,
            SourceRecord::where('source_key', $key)
                ->orderBy('id')
                ->get()
                ->pluck('payload')
                ->all(),
        );

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
