<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

/** Validates the uploaded CSV import file for a bulk student import. */
final class ImportStudentsRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'extensions:csv',
                'mimetypes:text/csv,text/plain,application/csv,application/vnd.ms-excel',
                'max:2048',
            ],
        ];
    }
}
