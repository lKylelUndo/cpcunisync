<?php

namespace App\Http\Services\AdminRegistration;

use App\Http\Repository\UserRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists CPC staff registrations for administrator review. */
final class GetAllRegistrationsService
{
    use ApiResponses;

    public static function GetAllRegistrations(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));
        $status = (string) $request->input('status', 'pending');

        if (! in_array($status, ['pending', 'verified', 'rejected'], true)) {
            $status = 'pending';
        }

        $filters = [
            'status' => $status,
            'q' => $request->input('q'),
        ];

        try {
            $result = (new UserRepository)->searchRegistrations($filters, $page, $perPage);

            $items = $result['items']
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department !== null ? [
                        'id' => $user->department->id,
                        'code' => $user->department->code,
                        'name' => $user->department->name,
                    ] : null,
                    'status' => $user->status,
                    'verification_note' => $user->verification_note,
                    'verified_by' => $user->verified_by,
                    'verified_at' => $user->verified_at?->toISOString(),
                    'registered_at' => $user->created_at?->toISOString(),
                ])
                ->values()
                ->all();

            return self::success('Registrations retrieved successfully.', [
                'items' => $items,
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
                'total_pages' => $result['total_pages'],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve registrations.');
        }
    }
}
