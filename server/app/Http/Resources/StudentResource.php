<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_number' => $this->student_number,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,
            'full_name' => trim(implode(' ', array_filter([
                $this->first_name,
                $this->middle_name,
                $this->last_name,
                $this->suffix,
            ]))),
            'email' => $this->email,
            'phone' => $this->phone,
            'sex' => $this->sex,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'address' => $this->address,
            'year_level' => $this->year_level,
            'status' => $this->status,
            'source' => $this->source,
            'integrity_status' => $this->integrity_status,
            'duplicate_of_id' => $this->duplicate_of_id,
            'program_id' => $this->program_id,
            'department_id' => $this->department_id,
            'program' => $this->whenLoaded('program', fn () => $this->program ? [
                'id' => $this->program->id,
                'code' => $this->program->code,
                'name' => $this->program->name,
                'department' => $this->program->relationLoaded('department') && $this->program->department ? [
                    'id' => $this->program->department->id,
                    'code' => $this->program->department->code,
                    'name' => $this->program->department->name,
                ] : null,
            ] : null),
            'department' => $this->whenLoaded('department', fn () => $this->department ? [
                'id' => $this->department->id,
                'code' => $this->department->code,
                'name' => $this->department->name,
            ] : null),
            'duplicate_of' => $this->whenLoaded('duplicateOf', fn () => $this->duplicateOf ? new self($this->duplicateOf) : null),
            'enrollments_count' => $this->whenCounted('enrollments_count'),
            'enrollments' => EnrollmentResource::collection($this->whenLoaded('enrollments')),
            'academic_records' => AcademicRecordResource::collection($this->whenLoaded('academicRecords')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
