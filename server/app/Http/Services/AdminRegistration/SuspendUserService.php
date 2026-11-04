<?php

namespace App\Http\Services\AdminRegistration;

use App\Http\Repository\UserRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Suspends a verified CPC staff account and revokes its sessions. */
final class SuspendUserService
{
    use ApiResponses;

    public static function SuspendUser(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();

        if (! $admin instanceof User) {
            return self::error('You are not authenticated.', 'unauthenticated');
        }

        try {
            $repository = new UserRepository;
            $user = $repository->findById($id);

            if ($user === null) {
                return self::error('The user account could not be found.', 'notFound');
            }

            if ($user->role === 'admin') {
                return self::error('Administrator accounts cannot be suspended.', 'adminNotModifiable');
            }

            if (! in_array($user->role, ['registrar', 'department_head'], true)) {
                return self::error('Only staff accounts can be suspended.', 'notSuspendable');
            }

            if ($user->status !== 'verified') {
                return self::error('Only verified accounts can be suspended.', 'notSuspendable');
            }

            $oldStatus = $user->status;
            $suspended = $repository->updateStatus($user, [
                'status' => 'suspended',
            ]);
            $repository->revokeTokens($suspended);

            AuditService::Record('suspended_user', 'User', $suspended->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'suspended',
            ], $admin, $request->ip());

            return self::success('User suspended successfully.', [
                'user' => self::userPayload($suspended),
            ]);
        } catch (Throwable) {
            return self::error('Unable to suspend the user.', 'suspensionFailed');
        }
    }

    /**
     * @return array<string, mixed>
     */
    private static function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department_id' => $user->department_id,
            'status' => $user->status,
            'verification_note' => $user->verification_note,
            'verified_by' => $user->verified_by,
            'verified_at' => $user->verified_at?->toISOString(),
        ];
    }
}
