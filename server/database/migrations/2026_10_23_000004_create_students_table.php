<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_number', 30)->unique();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->enum('sex', ['male', 'female', 'other']);
            $table->date('birth_date');
            $table->text('address')->nullable();
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->tinyInteger('year_level')->default(1);
            $table->enum('status', ['active', 'inactive', 'graduated', 'dropped'])->default('active');
            $table->string('source', 20)->nullable();
            $table->enum('integrity_status', ['clean', 'duplicate_suspect', 'pending_review'])->default('clean');
            $table->unsignedBigInteger('duplicate_of_id')->nullable();
            $table->index('duplicate_of_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
