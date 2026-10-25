<?php

namespace App\Http\Services\AdminRegistration;

use App\Http\Repository\UserRepository;
use App\Http\Requests\AdminRegistration\RejectUserRequest;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Throwable;

/** Rejects a CPC staff registration with an optional note. */
final class RejectUserService
{
    use ApiResponses;

    public static function RejectUser(RejectUserRequest $request, int $id): JsonResponse
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

            if ($user->status === 'rejected') {
                return self::error('This registration has already been rejected.', 'alreadyRejected');
            }

            $data = $request->validated();
            $note = isset($data['note']) ? trim((string) $data['note']) : null;
            $note = $note === '' ? null : $note;

            $oldStatus = $user->status;
            $rejected = $repository->updateStatus($user, [
                'status' => 'rejected',
                'verification_note' => $note,
            ]);

            AuditService::Record('rejected_user', 'User', $rejected->id, [
                'status' => $oldStatus,
            ], [
                'status' => 'rejected',
                'verification_note' => $note,
            ], $admin, $request->ip());

            return self::success('User registration rejected successfully.', [
                'user' => self::userPayload($rejected),
            ]);
        } catch (Throwable) {
            return self::error('Unable to reject the user.', 'rejectionFailed');
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
