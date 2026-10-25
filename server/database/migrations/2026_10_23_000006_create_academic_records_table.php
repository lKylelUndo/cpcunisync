<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enrollment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject_code', 20);
            $table->string('subject_name');
            $table->enum('semester', ['1st', '2nd', 'summer']);
            $table->decimal('grade', 5, 2)->nullable();
            $table->enum('remarks', ['passed', 'failed', 'incomplete', 'ongoing'])->nullable();
            $table->string('academic_year', 9);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_records');
    }
};
