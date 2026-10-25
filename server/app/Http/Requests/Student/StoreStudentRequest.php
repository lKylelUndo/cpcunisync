<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

/** Validates a new central student payload. */
final class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
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
            'birth_date' => ['required', 'date', 'before:today'],
            'address' => ['nullable', 'string'],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'year_level' => ['nullable', 'integer', 'between:1,4'],
            'status' => ['nullable', 'in:active,inactive,graduated,dropped'],
            'source' => ['nullable', 'string', 'max:20'],
        ];
    }
}
