<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'verified', 'rejected', 'suspended'])
                ->default('verified')
                ->change();
        });
    }

    public function down(): void
    {
        DB::table('users')
            ->where('status', 'suspended')
            ->update(['status' => 'verified']);

        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'verified', 'rejected'])
                ->default('verified')
                ->change();
        });
    }
};
