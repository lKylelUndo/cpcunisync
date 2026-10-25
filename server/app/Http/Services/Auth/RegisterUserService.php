<?php

namespace App\Http\Services\Auth;

use App\Http\Repository\UserRepository;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Throwable;

/** Submits a CPC staff self-registration for administrator verification. */
final class RegisterUserService
{
    use ApiResponses;

    public static function RegisterUser(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = (string) $data['role'];

        if (! in_array($role, ['registrar', 'department_head'], true)) {
            return self::error('The selected role is not available for registration.', 'invalidRole');
        }

        $email = mb_strtolower(trim((string) $data['email']));
        $repository = new UserRepository;

        if ($repository->findByEmail($email) !== null) {
            return self::error('An account with this email address already exists.', 'emailExists');
        }

        try {
            $user = $repository->create([
                'name' => trim((string) $data['name']),
                'email' => $email,
                'password' => $data['password'],
                'role' => $role,
                'department_id' => $role === 'department_head' ? (int) $data['department_id'] : null,
                'status' => 'pending',
            ]);

            AuditService::Record('registered', 'User', $user->id, null, [
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ], null, $request->ip());

            return self::success(
                'Registration submitted. An administrator will verify your account before you can log in.',
                [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'department_id' => $user->department_id,
                        'status' => $user->status,
                    ],
                ],
            );
        } catch (Throwable) {
            return self::error('Unable to submit registration. Please try again.', 'registrationFailed');
        }
    }
}
