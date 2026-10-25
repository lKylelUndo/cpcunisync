<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One execution of a source synchronisation job. */
class SyncRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'method',
        'status',
        'extracted',
        'loaded',
        'updated',
        'skipped',
        'duplicates',
        'failed',
        'message',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
            'extracted' => 'integer',
            'loaded' => 'integer',
            'updated' => 'integer',
            'skipped' => 'integer',
            'duplicates' => 'integer',
            'failed' => 'integer',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function syncErrors(): HasMany
    {
        return $this->hasMany(SyncError::class);
    }
}
