<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Program;
use Illuminate\Database\Seeder;

/** Seeds the three colleges and their four academic programs. */
class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['code' => 'COE', 'name' => 'College of Education'],
            ['code' => 'CIT', 'name' => 'College of Information Technology'],
            ['code' => 'CHM', 'name' => 'College of Hospitality Management'],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }

        $programs = [
            ['code' => 'BSEd', 'name' => 'Bachelor of Secondary Education', 'department' => 'COE'],
            ['code' => 'BEEd', 'name' => 'Bachelor of Elementary Education', 'department' => 'COE'],
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'department' => 'CIT'],
            ['code' => 'BSHM', 'name' => 'Bachelor of Science in Hospitality Management', 'department' => 'CHM'],
        ];

        foreach ($programs as $program) {
            $department = Department::query()
                ->where('code', $program['department'])
                ->firstOrFail();

            Program::create([
                'code' => $program['code'],
                'name' => $program['name'],
                'department_id' => $department->id,
            ]);
        }
    }
}
