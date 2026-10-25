<?php

namespace App\Http\Requests\Enrollment;

use Illuminate\Foundation\Http\FormRequest;

/** Validates a new term enrollment payload. */
final class StoreEnrollmentRequest extends FormRequest
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
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'semester' => ['required', 'in:1st,2nd,summer'],
            'status' => ['nullable', 'in:enrolled,dropped,completed,pending'],
            'enrolled_at' => ['nullable', 'date'],
        ];
    }
}
