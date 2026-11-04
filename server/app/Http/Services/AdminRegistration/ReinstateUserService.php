<?php

namespace App\Http\Services\AdminRegistration;

use App\Http\Repository\UserRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Reinstates a suspended CPC staff account. */
final class ReinstateUserService
{
    use ApiResponses;

    public static function ReinstateUser(Request $request, int $id): JsonResponse
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
                return self::error('Administrator accounts cannot be reinstated.', 'adminNotModifiable');
            }

            if (! in_array($user->role, ['registrar', 'department_head'], true)) {
                return self::error('Only staff accounts can be reinstated.', 'notSuspended');
            }

            if ($user->status !== 'suspended') {
                return self::error('Only suspended accounts can be reinstated.', 'notSuspended');
            }

            $oldStatus = $user->status;
            $reinstated = $repository->updateStatus($user, [
                'status' => 'verified',
            ]);

            AuditService::Record('reinstated_user', 'User', $reinstated->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'verified',
            ], $admin, $request->ip());

            return self::success('User reinstated successfully.', [
                'user' => self::userPayload($reinstated),
            ]);
        } catch (Throwable) {
            return self::error('Unable to reinstate the user.', 'reinstatementFailed');
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
