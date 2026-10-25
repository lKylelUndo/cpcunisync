"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, PlusIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { Pagination } from "@/components/features/shared/Pagination";
import { StudentsFilters } from "@/components/features/students/StudentsFilters";
import { StudentsFormDialog } from "@/components/features/students/StudentsFormDialog";
import { StudentsTable } from "@/components/features/students/StudentsTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  lookupService,
  type DepartmentLookup,
  type ProgramLookup,
} from "@/services/lookup.service";
import {
  studentService,
  type IntegrityStatus,
  type Student,
  type StudentFilters,
  type StudentStatus,
} from "@/services/student.service";
import type { PaginatedData } from "@/services/types";

export function StudentsView() {
  const { canWrite } = useAuth();
  const [students, setStudents] = useState<PaginatedData<Student> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    per_page: 10,
  });
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState<DepartmentLookup[]>([]);
  const [programs, setPrograms] = useState<ProgramLookup[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim() || undefined;

      setFilters((current) =>
        current.q === nextSearch
          ? current
          : { ...current, q: nextSearch, page: 1 },
      );
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;

    const loadLookups = async () => {
      try {
        const [departmentResponse, programResponse] = await Promise.all([
          lookupService.getDepartments(),
          lookupService.getPrograms(),
        ]);

        if (!active) {
          return;
        }

        if (departmentResponse.status === "success" && departmentResponse.data) {
          setDepartments(departmentResponse.data);
        }

        if (programResponse.status === "success" && programResponse.data) {
          setPrograms(programResponse.data);
        }
      } catch (error) {
        if (active) {
          toast.error(apiErrorMessage(error));
        }
      }
    };

    void loadLookups();

    return () => {
      active = false;
    };
  }, []);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await studentService.getAllStudents(filters);

      if (response.status === "success" && response.data) {
        setStudents(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const resetFilters = () => {
    setSearch("");
    setFilters({ page: 1, per_page: filters.per_page ?? 10 });
  };

  const filteredPrograms = filters.department_id
    ? programs.filter(
        (program) => program.department_id === filters.department_id,
      )
    : programs;

  const openCreate = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await studentService.deleteStudent(deleteTarget.id);

      if (response.status === "success") {
        toast.success(response.message);
        setDeleteTarget(null);
        await loadStudents();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Students"
        description="Central registry for every student pushed by departments or entered by the registrar."
        actions={
          canWrite ? (
            <Button onClick={openCreate}>
              <PlusIcon />
              Create student
            </Button>
          ) : null
        }
      />

      <StudentsFilters
        search={search}
        departmentId={filters.department_id}
        programId={filters.program_id}
        status={filters.status}
        yearLevel={filters.year_level}
        integrityStatus={filters.integrity_status}
        departments={departments}
        programs={filteredPrograms}
        onSearchChange={setSearch}
        onDepartmentChange={(departmentId) =>
          setFilters((current) => ({
            ...current,
            department_id: departmentId,
            program_id: undefined,
            page: 1,
          }))
        }
        onProgramChange={(programId) =>
          setFilters((current) => ({
            ...current,
            program_id: programId,
            page: 1,
          }))
        }
        onStatusChange={(status: StudentStatus | undefined) =>
          setFilters((current) => ({ ...current, status, page: 1 }))
        }
        onYearLevelChange={(yearLevel) =>
          setFilters((current) => ({
            ...current,
            year_level: yearLevel,
            page: 1,
          }))
        }
        onIntegrityStatusChange={(integrityStatus: IntegrityStatus | undefined) =>
          setFilters((current) => ({
            ...current,
            integrity_status: integrityStatus,
            page: 1,
          }))
        }
        onReset={resetFilters}
      />

      <Card className="overflow-hidden py-0">
        {isLoading ? (
          <TableSkeleton />
        ) : students ? (
          <>
            <StudentsTable
              students={students.items}
              canWrite={canWrite}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={students.page}
              totalPages={students.total_pages}
              total={students.total}
              perPage={students.per_page}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page }))
              }
              disabled={isLoading}
            />
          </>
        ) : (
          <EmptyState
            icon={UsersIcon}
            title="Students could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button variant="outline" onClick={() => void loadStudents()}>
                Retry
              </Button>
            }
          />
        )}
      </Card>

      <StudentsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editingStudent}
        programs={programs}
        onSaved={() => void loadStudents()}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student record?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.full_name} (${deleteTarget.student_number}) and may affect linked enrollments and academic records.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {isDeleting ? <Loader2Icon className="animate-spin" /> : null}
              Delete student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
