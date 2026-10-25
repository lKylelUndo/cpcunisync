<?php

namespace App\Http\Requests\AdminRegistration;

use Illuminate\Foundation\Http\FormRequest;

/** Validates an administrator rejection note. */
final class RejectUserRequest extends FormRequest
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
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
