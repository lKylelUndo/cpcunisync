<?php

namespace App\Http\Repository;

use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Collection;

/** Stateless query layer for enrollments. */
class EnrollmentRepository
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{items: Collection<int, Enrollment>, page: int, per_page: int, total: int, total_pages: int}
     */
    public function search(array $filters, int $page, int $perPage): array
    {
        $query = Enrollment::query()
            ->with(['student.program.department', 'student.department'])
            ->withCount('academicRecords');

        foreach (['student_id'] as $filter) {
            if (! empty($filters[$filter])) {
                $query->where($filter, (int) $filters[$filter]);
            }
        }

        foreach (['academic_year', 'semester', 'status'] as $filter) {
            if (! empty($filters[$filter])) {
                $query->where($filter, (string) $filters[$filter]);
            }
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

    public function findById(int $id): ?Enrollment
    {
        return Enrollment::query()->find($id);
    }

    public function findDetailed(int $id): ?Enrollment
    {
        return Enrollment::query()
            ->with(['student.program.department', 'student.department', 'academicRecords'])
            ->find($id);
    }

    public function findForTerm(int $studentId, string $academicYear, string $semester): ?Enrollment
    {
        return Enrollment::query()
            ->where('student_id', $studentId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Enrollment
    {
        return Enrollment::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Enrollment $enrollment, array $data): Enrollment
    {
        $enrollment->fill($data);
        $enrollment->save();

        return $enrollment->refresh();
    }

    public function delete(Enrollment $enrollment): void
    {
        $enrollment->delete();
    }

    /**
     * @return Collection<int, Enrollment>
     */
    public function allForStudent(int $studentId): Collection
    {
        return Enrollment::query()->where('student_id', $studentId)->get();
    }

    public function moveToStudent(Enrollment $enrollment, int $studentId): void
    {
        $enrollment->student_id = $studentId;
        $enrollment->save();
    }
}
