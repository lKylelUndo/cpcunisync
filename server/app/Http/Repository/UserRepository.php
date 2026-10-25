<?php

namespace App\Http\Repository;

use App\Models\User;

/** Data access for authentication users and their Sanctum tokens. */
class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->where('email', mb_strtolower(trim($email)))
            ->first();
    }

    public function findById(int $id): ?User
    {
        return User::query()->with('department')->find($id);
    }

    public function createToken(User $user, string $deviceName): string
    {
        return $user->createToken($deviceName)->plainTextToken;
    }

    public function revokeCurrentToken(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token !== null && method_exists($token, 'delete')) {
            $token->delete();
        }
    }
}
