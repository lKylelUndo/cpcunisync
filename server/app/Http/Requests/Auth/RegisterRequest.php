<?php

namespace App\Http\Requests\Auth;

use App\Http\Repository\UserRepository;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

/** Validates a CPC staff self-registration payload. */
final class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', 'in:registrar,department_head'],
            'department_id' => [
                'required_if:role,department_head',
                'nullable',
                'integer',
                'exists:departments,id',
            ],
        ];
    }

    /**
     * Keep duplicate registration attempts inside the flat error envelope so
     * clients can branch on the stable "emailExists" source.
     */
    protected function failedValidation(Validator $validator): void
    {
        $email = mb_strtolower(trim((string) $this->input('email')));

        if (
            $email !== ''
            && $validator->errors()->has('email')
            && (new UserRepository)->findByEmail($email) !== null
        ) {
            throw new HttpResponseException(response()->json([
                'status' => 'error',
                'message' => 'An account with this email address already exists.',
                'source' => 'emailExists',
            ]));
        }

        parent::failedValidation($validator);
    }
}
