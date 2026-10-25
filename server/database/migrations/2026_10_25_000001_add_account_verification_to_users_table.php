<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['pending', 'verified', 'rejected'])
                ->default('verified')
                ->after('department_id');
            $table->string('verification_note')->nullable()->after('status');
            $table->unsignedBigInteger('verified_by')->nullable()->index()->after('verification_note');
            $table->timestamp('verified_at')->nullable()->after('verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['verified_by']);
            $table->dropColumn(['status', 'verification_note', 'verified_by', 'verified_at']);
        });
    }
};
