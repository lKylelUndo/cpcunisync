<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** One uploaded CSV row persisted as source data for the ETL pipeline. */
class SourceRecord extends Model
{
    use HasFactory;

    protected $fillable = ['source_key', 'student_number', 'payload'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }
}
