<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Student;
use App\Models\AcademicRecord;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;

/** Seeds central students plus representative enrollments and academic results. */
class StudentsSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
                'student_number' => '2025-BSED-0001',
                'first_name' => 'Maria',
                'middle_name' => 'Clara',
                'last_name' => 'Santos',
                'sex' => 'female',
                'birth_date' => '2003-02-11',
                'email' => 'maria.santos@cpc.edu.ph',
                'phone' => '09171234001',
                'address' => '123 Rizal Street, San Fernando, Pampanga',
                'program' => 'BSEd',
                'year_level' => 4,
                'status' => 'active',
            ],
            [
                'student_number' => '2025-BSED-0002',
                'first_name' => 'Kristine Joy',
                'middle_name' => 'Lopez',
                'last_name' => 'Navarro',
                'sex' => 'female',
                'birth_date' => '2003-04-30',
                'email' => 'kristine.navarro@cpc.edu.ph',
                'phone' => '09171234002',
                'address' => '56 Luna Street, Mexico, Pampanga',
                'program' => 'BSEd',
                'year_level' => 3,
                'status' => 'active',
            ],
            [
                'student_number' => '2025-BEED-0001',
                'first_name' => 'John Carlo',
                'middle_name' => 'Reyes',
                'last_name' => 'Villanueva',
                'sex' => 'male',
                'birth_date' => '2002-01-25',
                'email' => 'john.villanueva@cpc.edu.ph',
                'phone' => '09171234003',
                'address' => '12 Mabini Street, Mabalacat, Pampanga',
                'program' => 'BEEd',
                'year_level' => 3,
                'status' => 'active',
            ],
            [
                'student_number' => '2025-BEED-0002',
                'first_name' => 'Daniel Christian',
                'middle_name' => 'Ocampo',
                'last_name' => 'Aquino',
                'sex' => 'male',
                'birth_date' => '2002-03-05',
                'email' => 'daniel.aquino@cpc.edu.ph',
                'phone' => '09171234004',
                'address' => '101 Dao Street, Floridablanca, Pampanga',
                'program' => 'BEEd',
                'year_level' => 2,
                'status' => 'dropped',
            ],
            [
                'student_number' => '2025-BSIT-0001',
                'first_name' => 'Paolo Gabriel',
                'middle_name' => 'Reyes',
                'last_name' => 'Mendoza',
                'sex' => 'male',
                'birth_date' => '2002-07-19',
                'email' => 'paolo.mendoza@cpc.edu.ph',
                'phone' => '09171234005',
                'address' => '45 MacArthur Highway, Angeles City, Pampanga',
                'program' => 'BSIT',
                'year_level' => 4,
                'status' => 'active',
            ],
            [
                'student_number' => '2025-BSIT-0002',
                'first_name' => 'Liza Marie',
                'middle_name' => 'Cruz',
                'last_name' => 'Fernandez',
                'sex' => 'female',
                'birth_date' => '2003-06-08',
                'email' => 'liza.fernandez@cpc.edu.ph',
                'phone' => '09171234006',
                'address' => '33 Bonifacio Street, Guagua, Pampanga',
                'program' => 'BSIT',
                'year_level' => 3,
                'status' => 'active',
            ],
            [
                'student_number' => '2025-BSIT-0003',
                'first_name' => 'Joshua Emmanuel',
                'middle_name' => 'Tan',
                'last_name' => 'Lim',
                'sex' => 'male',
                'birth_date' => '2002-09-12',
                'email' => 'joshua.lim@cpc.edu.ph',
                'phone' => '09171234007',
                'address' => '88 San Jose Street, San Fernando, Pampanga',
                'program' => 'BSIT',
                'year_level' => 3,
                'status' => 'inactive',
            ],
            [
                'student_number' => '2025-BSHM-0001',
                'first_name' => 'Ana Beatriz',
                'middle_name' => 'D.',
                'last_name' => 'Dela Peña',
                'sex' => 'female',
                'birth_date' => '2003-11-03',
                'email' => 'ana.delapena@cpc.edu.ph',
                'phone' => '09171234008',
                'address' => '78 Hospitality Avenue, Clark, Pampanga',
                'program' => 'BSHM',
                'year_level' => 4,
                'status' => 'active',
            ],
            [
                'student_number' => '2025-BSHM-0002',
                'first_name' => 'Mark Anthony',
                'middle_name' => 'Garcia',
                'last_name' => 'Bautista',
                'sex' => 'male',
                'birth_date' => '2001-12-15',
                'email' => 'mark.bautista@cpc.edu.ph',
                'phone' => '09171234009',
                'address' => '9 Sunset Boulevard, Angeles City, Pampanga',
                'program' => 'BSHM',
                'year_level' => 4,
                'status' => 'graduated',
            ],
            [
                'student_number' => '2025-BSHM-0003',
                'first_name' => 'Patricia Anne',
                'middle_name' => 'Ramos',
                'last_name' => 'Gomez',
                'sex' => 'female',
                'birth_date' => '2003-08-21',
                'email' => 'patricia.gomez@cpc.edu.ph',
                'phone' => '09171234010',
                'address' => '27 Friendship Road, Angeles City, Pampanga',
                'program' => 'BSHM',
                'year_level' => 4,
                'status' => 'graduated',
            ],
        ];

        $indexed = [];

        foreach ($students as $student) {
            $program = Program::query()->where('code', $student['program'])->firstOrFail();

            $indexed[$student['student_number']] = Student::create([
                'student_number' => $student['student_number'],
                'first_name' => $student['first_name'],
                'middle_name' => $student['middle_name'],
                'last_name' => $student['last_name'],
                'suffix' => null,
                'email' => $student['email'],
                'phone' => $student['phone'],
                'sex' => $student['sex'],
                'birth_date' => $student['birth_date'],
                'address' => $student['address'],
                'program_id' => $program->id,
                'department_id' => $program->department_id,
                'year_level' => $student['year_level'],
                'status' => $student['status'],
                'source' => 'central',
                'integrity_status' => 'clean',
                'duplicate_of_id' => null,
            ]);
        }

        $terms = [
            '2025-BSED-0001' => [
                ['2025-2026', '1st', 'enrolled', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 91, 'passed'],
                    ['EDU201', 'Foundations of Education', 89, 'passed'],
                ]],
                ['2025-2026', '2nd', 'enrolled', '2026-01-08', [
                    ['EDU202', 'Child and Adolescent Development', null, 'ongoing'],
                    ['GE02', 'Readings in Philippine History', null, 'ongoing'],
                ]],
            ],
            '2025-BSED-0002' => [
                ['2025-2026', '1st', 'enrolled', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 88, 'passed'],
                    ['EDU201', 'Foundations of Education', 90, 'passed'],
                ]],
                ['2025-2026', '2nd', 'enrolled', '2026-01-08', [
                    ['EDU202', 'Child and Adolescent Development', 87, 'passed'],
                    ['GE02', 'Readings in Philippine History', 92, 'passed'],
                ]],
            ],
            '2025-BEED-0001' => [
                ['2025-2026', '1st', 'enrolled', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 85, 'passed'],
                    ['EDU201', 'Foundations of Education', 83, 'passed'],
                ]],
                ['2025-2026', '2nd', 'enrolled', '2026-01-08', [
                    ['EDU202', 'Child and Adolescent Development', 84, 'passed'],
                    ['GE02', 'Readings in Philippine History', 86, 'passed'],
                ]],
            ],
            '2025-BEED-0002' => [
                ['2025-2026', '1st', 'dropped', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 76, 'passed'],
                    ['EDU201', 'Foundations of Education', 79, 'passed'],
                ]],
            ],
            '2025-BSIT-0001' => [
                ['2025-2026', '1st', 'enrolled', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 90, 'passed'],
                    ['ITE101', 'Introduction to Computing', 95, 'passed'],
                ]],
                ['2025-2026', '2nd', 'enrolled', '2026-01-08', [
                    ['ITE102', 'Programming Fundamentals', 94, 'passed'],
                    ['ITE201', 'Data Structures', 91, 'passed'],
                ]],
            ],
            '2025-BSIT-0002' => [
                ['2025-2026', '1st', 'enrolled', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 87, 'passed'],
                    ['ITE101', 'Introduction to Computing', 89, 'passed'],
                ]],
                ['2025-2026', '2nd', 'enrolled', '2026-01-08', [
                    ['ITE102', 'Programming Fundamentals', 88, 'passed'],
                    ['ITE201', 'Data Structures', 90, 'passed'],
                ]],
            ],
            '2025-BSIT-0003' => [
                ['2025-2026', '1st', 'pending', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 78, 'passed'],
                    ['ITE101', 'Introduction to Computing', 80, 'passed'],
                ]],
            ],
            '2025-BSHM-0001' => [
                ['2025-2026', '1st', 'enrolled', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 92, 'passed'],
                    ['HM101', 'Introduction to Hospitality Management', 93, 'passed'],
                ]],
                ['2025-2026', '2nd', 'enrolled', '2026-01-08', [
                    ['HM102', 'Food Safety and Sanitation', 89, 'passed'],
                    ['HM201', 'Front Office Operations', 90, 'passed'],
                ]],
            ],
            '2025-BSHM-0002' => [
                ['2025-2026', '1st', 'completed', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 85, 'passed'],
                    ['HM101', 'Introduction to Hospitality Management', 88, 'passed'],
                ]],
            ],
            '2025-BSHM-0003' => [
                ['2025-2026', '1st', 'completed', '2025-08-04', [
                    ['GE01', 'Understanding the Self', 90, 'passed'],
                    ['HM101', 'Introduction to Hospitality Management', 92, 'passed'],
                ]],
            ],
        ];

        foreach ($terms as $studentNumber => $plans) {
            $student = $indexed[$studentNumber];

            foreach ($plans as [$academicYear, $semester, $status, $enrolledAt, $records]) {
                $enrollment = Enrollment::create([
                    'student_id' => $student->id,
                    'academic_year' => $academicYear,
                    'semester' => $semester,
                    'status' => $status,
                    'enrolled_at' => $enrolledAt,
                ]);

                foreach ($records as [$code, $name, $grade, $remarks]) {
                    AcademicRecord::create([
                        'student_id' => $student->id,
                        'enrollment_id' => $enrollment->id,
                        'subject_code' => $code,
                        'subject_name' => $name,
                        'semester' => $semester,
                        'grade' => $grade,
                        'remarks' => $remarks,
                        'academic_year' => $academicYear,
                    ]);
                }
            }
        }
    }
}
