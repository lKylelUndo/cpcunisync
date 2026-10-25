<?php

namespace App\Http\Repository;

use App\Models\AcademicRecord;
use Illuminate\Database\Eloquent\Collection;

/** Stateless query layer for academic records. */
class AcademicRecordRepository
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{items: Collection<int, AcademicRecord>, page: int, per_page: int, total: int, total_pages: int}
     */
    public function search(array $filters, int $page, int $perPage): array
    {
        $query = AcademicRecord::query()
            ->with(['student.program.department', 'student.department', 'enrollment']);

        if (! empty($filters['student_id'])) {
            $query->where('student_id', (int) $filters['student_id']);
        }

        foreach (['academic_year', 'semester', 'remarks'] as $filter) {
            if (! empty($filters[$filter])) {
                $query->where($filter, (string) $filters[$filter]);
            }
        }

        if (! empty($filters['q'])) {
            $term = '%'.trim((string) $filters['q']).'%';
            $query->where(function ($query) use ($term): void {
                $query->where('subject_code', 'like', $term)
                    ->orWhere('subject_name', 'like', $term);
            });
        }

        $paginator = $query->orderByDesc('id')->paginate($perPage, ['*'], 'page', $page);

        return [
            'items' => $paginator->getCollection(),
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'total_pages' => $paginator->lastPage(),
        ];
    }

    public function findById(int $id): ?AcademicRecord
    {
        return AcademicRecord::query()->find($id);
    }

    public function findDetailed(int $id): ?AcademicRecord
    {
        return AcademicRecord::query()
            ->with(['student.program.department', 'student.department', 'enrollment'])
            ->find($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): AcademicRecord
    {
        return AcademicRecord::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(AcademicRecord $record, array $data): AcademicRecord
    {
        $record->fill($data);
        $record->save();

        return $record->refresh();
    }

    public function delete(AcademicRecord $record): void
    {
        $record->delete();
    }

    /**
     * @return Collection<int, AcademicRecord>
     */
    public function allForStudent(int $studentId): Collection
    {
        return AcademicRecord::query()->where('student_id', $studentId)->get();
    }

    public function findForTermSubject(
        int $studentId,
        string $subjectCode,
        string $academicYear,
        string $semester,
    ): ?AcademicRecord {
        return AcademicRecord::query()
            ->where('student_id', $studentId)
            ->where('subject_code', $subjectCode)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->first();
    }

    public function moveToStudent(AcademicRecord $record, int $studentId): void
    {
        $record->student_id = $studentId;
        $record->save();
    }
}
