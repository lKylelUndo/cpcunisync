<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AcademicRecordResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'enrollment_id' => $this->enrollment_id,
            'subject_code' => $this->subject_code,
            'subject_name' => $this->subject_name,
            'semester' => $this->semester,
            'grade' => $this->grade !== null ? (float) $this->grade : null,
            'remarks' => $this->remarks,
            'academic_year' => $this->academic_year,
            'student' => $this->whenLoaded('student', fn () => $this->student ? new StudentResource($this->student) : null),
            'enrollment' => $this->whenLoaded('enrollment', fn () => $this->enrollment ? new EnrollmentResource($this->enrollment) : null),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
