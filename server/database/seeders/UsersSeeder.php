<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/** Seeds the demo admin, registrar and department head accounts. */
class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Adrian Reyes',
            'email' => 'admin@cpc.edu.ph',
            'password' => Hash::make('Password1!'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Mariza Lopez',
            'email' => 'registrar@cpc.edu.ph',
            'password' => Hash::make('Password1!'),
            'role' => 'registrar',
        ]);

        $heads = [
            ['name' => 'Edwin Villamor', 'email' => 'coe-head@cpc.edu.ph', 'department' => 'COE'],
            ['name' => 'Grace Toledo', 'email' => 'cit-head@cpc.edu.ph', 'department' => 'CIT'],
            ['name' => 'Nestor Alonzo', 'email' => 'chm-head@cpc.edu.ph', 'department' => 'CHM'],
        ];

        foreach ($heads as $head) {
            $department = Department::query()
                ->where('code', $head['department'])
                ->firstOrFail();

            User::create([
                'name' => $head['name'],
                'email' => $head['email'],
                'password' => Hash::make('Password1!'),
                'role' => 'department_head',
                'department_id' => $department->id,
            ]);
        }
    }
}
