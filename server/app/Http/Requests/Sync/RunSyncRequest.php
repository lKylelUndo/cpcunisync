<?php

namespace App\Http\Requests\Sync;

use Illuminate\Foundation\Http\FormRequest;

/** Validates the optional department and method filters for a sync run. */
final class RunSyncRequest extends FormRequest
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
            'department_code' => ['nullable', 'string', 'in:education,it,hospitality'],
            'method' => ['nullable', 'string', 'in:etl,rest'],
        ];
    }
}
