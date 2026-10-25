<?php

namespace App\Http\Services\Student;

use App\Http\Repository\ProgramRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Creates a central student, flagging likely duplicates for review. */
final class PostStudentService
{
    use ApiResponses;

    public static function PostStudent(Request $request): JsonResponse
    {
        $data = $request->validated();

        $studentRepository = new StudentRepository;
        $existing = $studentRepository->findByStudentNumber($data['student_number']);

        if ($existing !== null) {
            return self::error('The student number already exists.', 'studentNumberExists');
        }

        try {
            $program = (new ProgramRepository)->findByIdBasic((int) $data['program_id']);

            if ($program === null) {
                return self::error('The selected program is invalid.', 'notValid');
            }

            $data['student_number'] = trim($data['student_number']);
            $data['department_id'] = $program->department_id;
            $data['year_level'] = $data['year_level'] ?? 1;
            $data['status'] = $data['status'] ?? 'active';
            $data['source'] = $data['source'] ?? 'manual';
            $data['integrity_status'] = 'clean';
            $data['duplicate_of_id'] = null;

            $candidate = DuplicateDetectionService::FindCandidates($data);

            if ($candidate !== null) {
                $data['integrity_status'] = 'duplicate_suspect';
                $data['duplicate_of_id'] = $candidate['student']->id;
            }

            $student = $studentRepository->create($data);
            $student->load(['program.department', 'department']);

            return self::success(
                'Student created successfully.',
                (new StudentResource($student))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to create the student.');
        }
    }
}
