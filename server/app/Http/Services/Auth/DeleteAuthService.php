<?php

namespace App\Http\Services\Auth;

use App\Http\Repository\UserRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Revokes the current Sanctum token for a signed-in user. */
final class DeleteAuthService
{
    use ApiResponses;

    public static function DeleteAuth(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            return self::error('You are not authenticated.', 'unauthenticated');
        }

        try {
            (new UserRepository)->revokeCurrentToken($user);
            AuditService::Record('logout', 'User', $user->id, null, null, $user, $request->ip());

            return self::success('Signed out successfully.');
        } catch (Throwable) {
            return self::error('Unable to sign out. Please try again.', 'logoutFailed');
        }
    }
}
