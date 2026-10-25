<?php

namespace App\Http\Repository;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/** Data access for authentication users and their Sanctum tokens. */
class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->where('email', mb_strtolower(trim($email)))
            ->first();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): User
    {
        return User::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{items: Collection<int, User>, page: int, per_page: int, total: int, total_pages: int}
     */
    public function searchRegistrations(array $filters, int $page, int $perPage): array
    {
        $query = User::query()
            ->with('department')
            ->whereIn('role', ['registrar', 'department_head']);

        if (! empty($filters['status'])) {
            $query->where('status', (string) $filters['status']);
        }

        if (! empty($filters['q'])) {
            $search = trim((string) $filters['q']);
            $term = '%'.$search.'%';

            $query->where(function ($query) use ($term): void {
                $query->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        $paginator = $query->orderByDesc('id')->paginate($perPage, ['*'], 'page', $page);

        return [
            'items' => $paginator->getCollection(),
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'total_pages' => $paginator->lastPage(),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function updateStatus(User $user, array $attributes): User
    {
        $user->fill($attributes);
        $user->save();

        return $user->refresh();
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
