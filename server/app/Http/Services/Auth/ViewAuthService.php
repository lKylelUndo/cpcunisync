<?php

namespace App\Http\Services\Auth;

use App\Http\Repository\UserRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns the profile of the currently authenticated user. */
final class ViewAuthService
{
    use ApiResponses;

    public static function ViewAuth(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            return self::error('You are not authenticated.', 'unauthenticated');
        }

        try {
            $fresh = (new UserRepository)->findById($user->id);

            if ($fresh === null) {
                return self::error('The user account could not be found.', 'notFound');
            }

            return self::success('Authenticated user retrieved.', [
                'id' => $fresh->id,
                'name' => $fresh->name,
                'email' => $fresh->email,
                'role' => $fresh->role,
                'department_id' => $fresh->department_id,
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve the authenticated user.', 'authFailed');
        }
    }
}
