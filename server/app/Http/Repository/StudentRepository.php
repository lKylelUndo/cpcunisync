<?php

namespace App\Http\Repository;

use App\Models\Student;
use Closure;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/** Stateless query layer for central student records. */
class StudentRepository
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{items: Collection<int, Student>, page: int, per_page: int, total: int, total_pages: int}
     */
    public function search(array $filters, int $page, int $perPage): array
    {
        $query = Student::query()
            ->with(['program.department', 'department'])
            ->withCount('enrollments');

        if (! empty($filters['q'])) {
            $search = trim((string) $filters['q']);
            $term = '%'.$search.'%';
            $words = preg_split('/\s+/u', $search, -1, PREG_SPLIT_NO_EMPTY) ?: [];

            $query->where(function ($query) use ($term, $words): void {
                $query->where('student_number', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere(function ($nameQuery) use ($words): void {
                        foreach ($words as $word) {
                            $part = '%'.$word.'%';
                            $nameQuery->where(function ($fieldQuery) use ($part): void {
                                $fieldQuery->where('first_name', 'like', $part)
                                    ->orWhere('middle_name', 'like', $part)
                                    ->orWhere('last_name', 'like', $part)
                                    ->orWhere('suffix', 'like', $part);
                            });
                        }
                    });
            });
        }

        foreach (['department_id', 'program_id', 'year_level'] as $filter) {
            if (isset($filters[$filter]) && $filters[$filter] !== '') {
                $query->where($filter, (int) $filters[$filter]);
            }
        }

        foreach (['status', 'integrity_status'] as $filter) {
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

    /**
     * @param  array<int, string>  $with
     */
    public function findById(int $id, array $with = []): ?Student
    {
        return Student::query()->with($with)->find($id);
    }

    public function findDetailed(int $id): ?Student
    {
        return Student::query()
            ->with([
                'program.department',
                'department',
                'duplicateOf',
                'enrollments.academicRecords',
                'academicRecords',
            ])
            ->find($id);
    }

    public function findByStudentNumber(string $studentNumber): ?Student
    {
        return Student::query()
            ->where('student_number', trim($studentNumber))
            ->first();
    }

    /**
     * Return possible duplicate matches in intent priority order (number, email, name + birth date).
     *
     * @param  array<string, mixed>  $data
     * @return Collection<int, Student>
     */
    public function findCandidates(array $data, ?int $ignoreId = null): Collection
    {
        $candidates = new Collection;

        $studentNumber = trim((string) ($data['student_number'] ?? ''));
        if ($studentNumber !== '') {
            $matches = Student::query()
                ->with(['program.department', 'department'])
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('student_number', $studentNumber)
                ->get();

            $candidates = $candidates->merge($matches);
        }

        $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
        if ($email !== '') {
            $matches = Student::query()
                ->with(['program.department', 'department'])
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('email', $email)
                ->get();

            $candidates = $candidates->merge($matches);
        }

        $firstName = trim((string) ($data['first_name'] ?? ''));
        $lastName = trim((string) ($data['last_name'] ?? ''));
        $birthDate = $data['birth_date'] ?? null;

        if ($firstName !== '' && $lastName !== '' && ! empty($birthDate)) {
            $matches = Student::query()
                ->with(['program.department', 'department'])
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('first_name', $firstName)
                ->where('last_name', $lastName)
                ->whereDate('birth_date', $birthDate)
                ->get();

            $candidates = $candidates->merge($matches);
        }

        return $candidates->unique('id')->values();
    }

    /**
     * @return Collection<int, Student>
     */
    public function duplicateSuspects(): Collection
    {
        return Student::query()
            ->with(['program.department', 'department', 'duplicateOf.program.department', 'duplicateOf.department'])
            ->where('integrity_status', 'duplicate_suspect')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Student
    {
        return Student::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Student $student, array $data): Student
    {
        $student->fill($data);
        $student->save();

        return $student->refresh();
    }

    public function delete(Student $student): void
    {
        $student->delete();
    }

    /**
     * Execute work inside a database transaction without leaking DB access into services.
     *
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     */
    public function transaction(Closure $callback): mixed
    {
        return DB::transaction($callback);
    }
}
