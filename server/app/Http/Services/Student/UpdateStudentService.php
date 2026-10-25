<?php

namespace App\Http\Services\Student;

use App\Http\Repository\ProgramRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Updates a central student after uniqueness and program guards. */
final class UpdateStudentService
{
    use ApiResponses;

    public static function UpdateStudent(Request $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $repository = new StudentRepository;
        $student = $repository->findById($id);

        if ($student === null) {
            return self::error('Student not found.', 'notFound');
        }

        $numberMatch = $repository->findByStudentNumber($data['student_number']);

        if ($numberMatch !== null && $numberMatch->id !== $student->id) {
            return self::error('The student number already exists.', 'studentNumberExists');
        }

        try {
            $program = (new ProgramRepository)->findByIdBasic((int) $data['program_id']);

            if ($program === null) {
                return self::error('The selected program is invalid.', 'notValid');
            }

            $data['student_number'] = trim($data['student_number']);
            $data['department_id'] = $program->department_id;

            if (array_key_exists('year_level', $data) && $data['year_level'] === null) {
                unset($data['year_level']);
            }

            if (array_key_exists('status', $data) && $data['status'] === null) {
                unset($data['status']);
            }

            $student = $repository->update($student, $data);
            $student->load(['program.department', 'department']);

            return self::success(
                'Student updated successfully.',
                (new StudentResource($student))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to update the student.');
        }
    }
}
