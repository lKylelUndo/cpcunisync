<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Models\Student;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection;

/** Intradomain helper that ranks and explains student duplicate candidates. */
final class DuplicateDetectionService
{
    /**
     * @param  array<string, mixed>  $data
     * @return array{student: Student, match_reason: string}|null
     */
    public static function FindCandidates(array $data, ?int $ignoreId = null): ?array
    {
        /** @var Collection<int, Student> $candidates */
        $candidates = (new StudentRepository)->findCandidates($data, $ignoreId);

        foreach ($candidates as $candidate) {
            $reason = self::MatchReason($candidate, $data);

            if ($reason !== null) {
                return [
                    'student' => $candidate,
                    'match_reason' => $reason,
                ];
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function MatchReason(Student $candidate, array $data): ?string
    {
        $studentNumber = trim((string) ($data['student_number'] ?? ''));
        if ($studentNumber !== '' && self::same($candidate->student_number, $studentNumber)) {
            return 'student_number';
        }

        $email = trim((string) ($data['email'] ?? ''));
        if ($email !== '' && $candidate->email !== null && self::same($candidate->email, $email)) {
            return 'email';
        }

        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));
        $birthDate = self::normalizedDate($data['birth_date'] ?? null);

        if (
            $firstName !== ''
            && $lastName !== ''
            && $birthDate !== null
            && self::same($candidate->first_name, $firstName)
            && self::same($candidate->last_name, $lastName)
            && self::normalizedDate($candidate->birth_date) === $birthDate
        ) {
            return 'name+birth_date';
        }

        return null;
    }

    public static function MatchReasonBetween(Student $duplicate, Student $primary): string
    {
        return self::MatchReason($duplicate, [
            'student_number' => $primary->student_number,
            'email' => $primary->email,
            'first_name' => $primary->first_name,
            'last_name' => $primary->last_name,
            'birth_date' => $primary->birth_date,
        ]) ?? 'name+birth_date';
    }

    private static function same(?string $left, ?string $right): bool
    {
        return mb_strtolower(trim((string) $left)) === mb_strtolower(trim((string) $right));
    }

    private static function normalizedDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        $timestamp = strtotime((string) $value);

        return $timestamp === false ? null : date('Y-m-d', $timestamp);
    }
}
