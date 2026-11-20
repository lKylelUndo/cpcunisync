<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('source_records', function (Blueprint $table) {
            $table->id();
            $table->string('source_key')->index();
            $table->string('student_number')->index();
            $table->json('payload');
            $table->timestamps();
            $table->unique(['source_key', 'student_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('source_records');
    }
};
