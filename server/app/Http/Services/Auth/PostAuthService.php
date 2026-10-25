<?php

namespace App\Http\Services\Auth;

use App\Http\Repository\UserRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Throwable;

/** Authenticates a user and issues a Sanctum API token. */
final class PostAuthService
{
    use ApiResponses;

    public static function PostAuth(Request $request): JsonResponse
    {
        $repository = new UserRepository;
        $user = $repository->findByEmail((string) $request->input('email'));

        if ($user === null || ! Hash::check((string) $request->input('password'), $user->password)) {
            return self::error('The provided credentials are incorrect.', 'invalidCredentials');
        }

        try {
            $deviceName = (string) $request->input('device_name', 'cpc-frontend');
            $token = $repository->createToken($user, $deviceName);

            AuditService::Record('login', 'User', $user->id, null, [
                'email' => $user->email,
                'device_name' => $deviceName,
            ], $user, $request->ip());

            return self::success('Signed in successfully.', [
                'token' => $token,
                'user' => self::userPayload($user),
            ]);
        } catch (Throwable) {
            return self::error('Unable to sign in. Please try again.', 'loginFailed');
        }
    }

    /**
     * @return array{id: int, name: string, email: string, role: string, department_id: int|null}
     */
    private static function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'department_id' => $user->department_id,
        ];
    }
}
