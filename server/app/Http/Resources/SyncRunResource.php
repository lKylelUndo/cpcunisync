<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SyncRunResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'department' => $this->whenLoaded('department', fn () => $this->department ? [
                'id' => $this->department->id,
                'code' => $this->department->code,
                'name' => $this->department->name,
            ] : null),
            'method' => $this->method,
            'status' => $this->status,
            'extracted' => $this->extracted,
            'loaded' => $this->loaded,
            'updated' => $this->updated,
            'skipped' => $this->skipped,
            'duplicates' => $this->duplicates,
            'failed' => $this->failed,
            'message' => $this->message,
            'started_at' => $this->started_at?->toISOString(),
            'finished_at' => $this->finished_at?->toISOString(),
            'errors_count' => $this->whenCounted('sync_errors_count'),
            'sync_errors' => SyncErrorResource::collection($this->whenLoaded('syncErrors')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
