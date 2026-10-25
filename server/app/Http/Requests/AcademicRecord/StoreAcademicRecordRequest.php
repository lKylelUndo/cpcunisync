<?php

namespace App\Http\Requests\AcademicRecord;

use Illuminate\Foundation\Http\FormRequest;

/** Validates a new academic record payload. */
final class StoreAcademicRecordRequest extends FormRequest
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
            'enrollment_id' => ['nullable', 'integer', 'exists:enrollments,id'],
            'subject_code' => ['required', 'string', 'max:20'],
            'subject_name' => ['required', 'string', 'max:255'],
            'semester' => ['required', 'in:1st,2nd,summer'],
            'grade' => ['nullable', 'numeric', 'between:0,100'],
            'remarks' => ['nullable', 'in:passed,failed,incomplete,ongoing'],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
        ];
    }
}
