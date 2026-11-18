<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/** Seeds the demo admin, registrar, department heads and one pending sign-up. Idempotent — re-running keeps existing accounts and only adds what is missing. */
class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@cpc.edu.ph'],
            ['name' => 'Adrian Reyes', 'password' => Hash::make('Password1!'), 'role' => 'admin', 'status' => 'verified'],
        );
        User::firstOrCreate(
            ['email' => 'registrar@cpc.edu.ph'],
            ['name' => 'Mariza Lopez', 'password' => Hash::make('Password1!'), 'role' => 'registrar', 'status' => 'verified'],
        );

        $heads = [
            ['name' => 'Edwin Villamor', 'email' => 'coe-head@cpc.edu.ph', 'department' => 'COE'],
            ['name' => 'Grace Toledo', 'email' => 'cit-head@cpc.edu.ph', 'department' => 'CIT'],
            ['name' => 'Nestor Alonzo', 'email' => 'chm-head@cpc.edu.ph', 'department' => 'CHM'],
        ];

        foreach ($heads as $head) {
            $department = Department::query()
                ->where('code', $head['department'])
                ->firstOrFail();

            User::firstOrCreate(
                ['email' => $head['email']],
                [
                    'name' => $head['name'],
                    'password' => Hash::make('Password1!'),
                    'role' => 'department_head',
                    'department_id' => $department->id,
                    'status' => 'verified',
                ],
            );
        }

        // One pending department-head sign-up so the Registrations page has an approval to demo.
        $department = Department::query()
            ->where('code', 'CIT')
            ->firstOrFail();

        User::firstOrCreate(
            ['email' => 'pending-head@cpc.edu.ph'],
            [
                'name' => 'Leah Navarro',
                'password' => Hash::make('Password1!'),
                'role' => 'department_head',
                'department_id' => $department->id,
                'status' => 'pending',
            ],
        );
    }
}
