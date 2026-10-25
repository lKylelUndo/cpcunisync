<?php

namespace App\Http\Services\Sync;

use App\Http\Repository\ProgramRepository;
use App\Models\Student;
use DateTimeImmutable;
use DateTimeInterface;

/** Cleanses raw source records into central student payloads. */
final class EtlService
{
    /**
     * @param  array<string, mixed>  $record
     * @return array<string, mixed>
     */
    public static function Transform(array $record, string $sourceKey): array
    {
        $program = (new ProgramRepository)->findByCode(
            (string) (self::first($record, ['program_code', 'program', 'programCode']) ?? ''),
        );

        return [
            'student_number' => self::stringValue(self::first($record, ['student_number', 'studentNumber'])) ?? '',
            'first_name' => self::nameValue(self::first($record, ['first_name', 'firstName'])) ?? '',
            'middle_name' => self::nameValue(self::first($record, ['middle_name', 'middleName'])),
            'last_name' => self::nameValue(self::first($record, ['last_name', 'lastName'])) ?? '',
            'suffix' => self::nameValue(self::first($record, ['suffix'])),
            'email' => self::emailValue(self::first($record, ['email'])),
            'phone' => self::phoneValue(self::first($record, ['phone', 'contact_number', 'contactNumber'])),
            'sex' => self::sexValue(self::first($record, ['sex', 'gender'])),
            'birth_date' => self::dateValue(self::first($record, ['birth_date', 'birthDate', 'dob'])),
            'address' => self::stringValue(self::first($record, ['address'])),
            'program_id' => $program?->id,
            'department_id' => $program?->department_id,
            'year_level' => min(4, max(1, (int) (self::first($record, ['year_level', 'yearLevel']) ?? 1))),
            'status' => self::statusValue(self::first($record, ['status'])),
            'source' => $sourceKey,
        ];
    }

    /**
     * Return non-empty incoming values that differ from the stored student.
     * Missing source fields never overwrite richer central data.
     *
     * @param  array<string, mixed>  $candidate
     * @return array<string, mixed>
     */
    public static function ChangedValues(Student $existing, array $candidate): array
    {
        $changes = [];

        foreach ($candidate as $field => $value) {
            if ($field === 'student_number' || $value === null || $value === '') {
                continue;
            }

            $current = $existing->getAttribute($field);

            if ($current === null || $current === '') {
                $changes[$field] = $value;

                continue;
            }

            if ($field === 'birth_date') {
                $currentDate = $current instanceof DateTimeInterface
                    ? $current->format('Y-m-d')
                    : trim((string) $current);

                if ($currentDate !== trim((string) $value)) {
                    $changes[$field] = $value;
                }

                continue;
            }

            if (trim((string) $current) !== trim((string) $value)) {
                $changes[$field] = $value;
            }
        }

        return $changes;
    }

    /**
     * @param  array<int, string>  $keys
     */
    private static function first(array $record, array $keys): mixed
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $record)) {
                return $record[$key];
            }
        }

        return null;
    }

    private static function stringValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private static function nameValue(mixed $value): ?string
    {
        $value = self::stringValue($value);

        return $value === null ? null : ucwords(mb_strtolower($value));
    }

    private static function emailValue(mixed $value): ?string
    {
        $value = self::stringValue($value);

        return $value === null ? null : mb_strtolower($value);
    }

    private static function phoneValue(mixed $value): ?string
    {
        $value = self::stringValue($value);

        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';

        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '63') && strlen($digits) === 12) {
            return '0'.substr($digits, 2);
        }

        if (str_starts_with($digits, '9') && strlen($digits) === 10) {
            return '0'.$digits;
        }

        return $digits;
    }

    private static function sexValue(mixed $value): ?string
    {
        $value = mb_strtolower(trim((string) $value));

        return match ($value) {
            'm', 'male' => 'male',
            'f', 'female' => 'female',
            'o', 'other' => 'other',
            default => null,
        };
    }

    private static function dateValue(mixed $value): ?string
    {
        $value = self::stringValue($value);

        if ($value === null) {
            return null;
        }

        foreach (['Y-m-d', 'm-d-Y', 'm/d/Y', 'j-n-Y', 'n/j/Y'] as $format) {
            $date = DateTimeImmutable::createFromFormat('!'.$format, $value);

            if ($date !== false && $date->format($format) === $value) {
                return $date->format('Y-m-d');
            }
        }

        $timestamp = strtotime($value);

        return $timestamp === false ? null : date('Y-m-d', $timestamp);
    }

    private static function statusValue(mixed $value): string
    {
        $value = mb_strtolower(trim((string) $value));

        return in_array($value, ['active', 'inactive', 'graduated', 'dropped'], true)
            ? $value
            : 'active';
    }
}
