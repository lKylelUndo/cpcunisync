<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Resources\EnrollmentResource;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns one enrollment with its student context and academic records. */
final class ViewEnrollmentService
{
    use ApiResponses;

    public static function ViewEnrollment(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $scope = $user !== null && $user->role === 'department_head'
            ? 'dept:'.($user->department_id ?? -1)
            : 'all';

        try {
            $payload = CacheService::remember('enrollments:detail:'.$id.':'.$scope, 300, function () use ($id): ?array {
                $enrollment = (new EnrollmentRepository)->findDetailed($id);

                return $enrollment === null
                    ? null
                    : (new EnrollmentResource($enrollment))->resolve();
            });
        } catch (Throwable) {
            return self::error('Unable to retrieve the enrollment.');
        }

        if ($payload === null) {
            return self::error('Enrollment not found.', 'notFound');
        }

        if ($user !== null
            && $user->role === 'department_head'
            && (int) ($payload['student']['department_id'] ?? 0) !== (int) $user->department_id) {
            abort(403, 'This action is unauthorized.');
        }

        return self::success('Enrollment retrieved successfully.', $payload);
    }
}
