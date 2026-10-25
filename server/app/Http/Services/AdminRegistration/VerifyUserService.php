<?php

namespace App\Http\Services\AdminRegistration;

use App\Http\Repository\UserRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Verifies a pending CPC staff registration. */
final class VerifyUserService
{
    use ApiResponses;

    public static function VerifyUser(Request $request, int $id): JsonResponse
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
                return self::error('Administrator accounts cannot be modified.', 'adminNotModifiable');
            }

            if ($user->status === 'verified') {
                return self::error('This account has already been verified.', 'alreadyVerified');
            }

            $oldStatus = $user->status;
            $verified = $repository->updateStatus($user, [
                'status' => 'verified',
                'verification_note' => null,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);

            AuditService::Record('verified_user', 'User', $verified->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'verified',
                'verified_by' => $admin->id,
                'verified_at' => $verified->verified_at?->toISOString(),
            ], $admin, $request->ip());

            return self::success('User verified successfully.', [
                'user' => self::userPayload($verified),
            ]);
        } catch (Throwable) {
            return self::error('Unable to verify the user.', 'verificationFailed');
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
