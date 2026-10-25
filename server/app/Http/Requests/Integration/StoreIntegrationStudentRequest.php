<?php

namespace App\Http\Requests\Integration;

use Illuminate\Foundation\Http\FormRequest;

/** Validates a student pushed through the REST integration endpoint. */
final class StoreIntegrationStudentRequest extends FormRequest
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
            'program_id' => ['nullable', 'integer', 'exists:programs,id'],
            'program_code' => ['nullable', 'string', 'max:10', 'required_without:program_id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'year_level' => ['nullable', 'integer', 'between:1,4'],
            'status' => ['nullable', 'in:active,inactive,graduated,dropped'],
            'source' => ['nullable', 'string', 'max:20'],
        ];
    }
}
