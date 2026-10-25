<?php

namespace App\Http\Services\Audit;

use App\Http\Repository\AuditLogRepository;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

/** Centralised audit writer used by observers and authentication services. */
final class AuditService
{
    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public static function Record(
        string $action,
        string $modelType,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $actor = null,
        ?string $ipAddress = null,
    ): void {
        $actorId = $actor?->id ?? Auth::id();
        $ipAddress ??= request()->ip();

        (new AuditLogRepository)->create([
            'user_id' => $actorId,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
        ]);
    }
}
