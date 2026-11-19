<?php

namespace App\Http\Services\Registration;

use App\Http\Repository\DepartmentRepository;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns the choices shown on the public staff registration form. */
final class GetRegistrationOptionsService
{
    use ApiResponses;

    public static function GetRegistrationOptions(Request $request): JsonResponse
    {
        try {
            $options = CacheService::remember('registration-options', 300, function (): array {
                $departments = (new DepartmentRepository)->all()
                    ->map(fn ($department) => [
                        'id' => $department->id,
                        'code' => $department->code,
                        'name' => $department->name,
                    ])
                    ->values()
                    ->all();

                return [
                    'departments' => $departments,
                    'roles' => ['registrar', 'department_head'],
                ];
            });

            return self::success('Registration options retrieved successfully.', $options);
        } catch (Throwable) {
            return self::error('Unable to retrieve registration options.');
        }
    }
}
