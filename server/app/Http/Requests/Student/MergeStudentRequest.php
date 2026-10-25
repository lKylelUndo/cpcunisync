<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

/** Validates the duplicate student selected for a merge. */
final class MergeStudentRequest extends FormRequest
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
            'duplicate_id' => ['required', 'integer', 'exists:students,id'],
        ];
    }
}
