<?php

namespace App\Observers;

use App\Http\Services\Audit\AuditService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

/** Writes generic created/updated/deleted audit entries through AuditService. */
class WritesAuditLogs
{
    /** @var array<int, string> */
    private array $excluded = ['password', 'remember_token'];

    public function created(Model $model): void
    {
        AuditService::Record(
            'created',
            class_basename($model),
            $model->getKey(),
            null,
            $this->filter($model->getAttributes()),
        );
    }

    public function updated(Model $model): void
    {
        $changes = $this->filter($model->getChanges());

        if ($changes === []) {
            return;
        }

        AuditService::Record(
            'updated',
            class_basename($model),
            $model->getKey(),
            Arr::only($model->getOriginal(), array_keys($changes)),
            $changes,
        );
    }

    public function deleted(Model $model): void
    {
        AuditService::Record(
            'deleted',
            class_basename($model),
            $model->getKey(),
            $this->filter($model->getAttributes()),
            null,
        );
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function filter(array $values): array
    {
        return Arr::except($values, $this->excluded);
    }
}
