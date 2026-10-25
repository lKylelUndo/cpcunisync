<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/** Seeds lookup data, portal users, central students and demo source files. */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            DepartmentsSeeder::class,
            UsersSeeder::class,
            StudentsSeeder::class,
            SourceDataSeeder::class,
        ]);
    }
}
