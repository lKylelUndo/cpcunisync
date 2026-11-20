<?php

namespace App\Http\Services\Student;

/**
 * Canonical CSV header row of the student import template.
 *
 * Single source of truth: the template download writes these headers and
 * the import service rejects any CSV whose header set deviates from them.
 */
final class StudentImportTemplateHeaders
{
    /**
     * @var list<string>
     */
    public const HEADERS = [
        'student_number',
        'first_name',
        'middle_name',
        'last_name',
        'sex',
        'birth_date',
        'email',
        'phone',
        'address',
        'program_code',
        'year_level',
        'status',
    ];
}
