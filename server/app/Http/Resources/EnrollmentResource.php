<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'academic_year' => $this->academic_year,
            'semester' => $this->semester,
            'status' => $this->status,
            'enrolled_at' => $this->enrolled_at?->format('Y-m-d'),
            'student' => $this->whenLoaded('student', fn () => $this->student ? new StudentResource($this->student) : null),
            'academic_records' => AcademicRecordResource::collection($this->whenLoaded('academicRecords')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
