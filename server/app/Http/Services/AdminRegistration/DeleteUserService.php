<?php

namespace App\Http\Services\AdminRegistration;

use App\Http\Repository\UserRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Permanently deletes a CPC staff account after revoking its sessions. */
final class DeleteUserService
{
    use ApiResponses;

    public static function DeleteUser(Request $request, int $id): JsonResponse
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
                return self::error('Administrator accounts cannot be deleted.', 'adminNotModifiable');
            }

            if (! in_array($user->role, ['registrar', 'department_head'], true)) {
                return self::error('Only staff accounts can be deleted.', 'notDeletable');
            }

            if (! in_array($user->status, ['pending', 'verified', 'rejected', 'suspended'], true)) {
                return self::error('This account cannot be deleted.', 'notDeletable');
            }

            $oldValues = [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department_id' => $user->department_id,
                'status' => $user->status,
                'verification_note' => $user->verification_note,
                'verified_by' => $user->verified_by,
                'verified_at' => $user->verified_at?->toISOString(),
            ];

            $repository->revokeTokens($user);
            $repository->delete($user);

            AuditService::Record('deleted_user', 'User', $id, $oldValues, null, $admin, $request->ip());

            return self::success('User deleted successfully.', [
                'id' => $id,
            ]);
        } catch (Throwable) {
            return self::error('Unable to delete the user.', 'deletionFailed');
        }
    }
}
