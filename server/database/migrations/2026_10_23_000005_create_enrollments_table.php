<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('academic_year', 9);
            $table->enum('semester', ['1st', '2nd', 'summer']);
            $table->enum('status', ['enrolled', 'dropped', 'completed', 'pending'])->default('enrolled');
            $table->date('enrolled_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'academic_year', 'semester']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
