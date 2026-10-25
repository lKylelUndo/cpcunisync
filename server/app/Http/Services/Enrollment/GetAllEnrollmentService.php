<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\EnrollmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists enrollments with filters and hand-rolled pagination. */
final class GetAllEnrollmentService
{
    use ApiResponses;

    public static function GetAllEnrollment(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));

        $filters = $request->only(['student_id', 'academic_year', 'semester', 'status']);

        try {
            $result = (new EnrollmentRepository)->search($filters, $page, $perPage);

            $items = $result['items']
                ->map(fn ($enrollment) => (new EnrollmentResource($enrollment))->resolve())
                ->values()
                ->all();

            return self::success('Enrollments retrieved successfully.', [
                'items' => $items,
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
                'total_pages' => $result['total_pages'],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve enrollments.');
        }
    }
}
