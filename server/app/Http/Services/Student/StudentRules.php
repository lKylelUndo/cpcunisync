<?php

namespace App\Http\Services\Student;

/** Shared validation rules for student payloads entering the API or ETL. */
final class StudentRules
{
    /**
     * @return array<string, array<int, string>>
     */
    public static function rules(): array
    {
        return [
            'student_number' => ['required', 'string', 'max:30'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'sex' => ['required', 'in:male,female,other'],
            'birth_date' => ['required', 'date'],
            'address' => ['nullable', 'string'],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'year_level' => ['nullable', 'integer', 'between:1,4'],
            'status' => ['nullable', 'in:active,inactive,graduated,dropped'],
            'source' => ['nullable', 'string', 'max:20'],
        ];
    }
}
