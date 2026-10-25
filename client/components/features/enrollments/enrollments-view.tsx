"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCapIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { EnrollmentFormDialog } from "@/components/features/enrollments/EnrollmentFormDialog";
import { EnrollmentsFilters } from "@/components/features/enrollments/EnrollmentsFilters";
import { EnrollmentsTable } from "@/components/features/enrollments/EnrollmentsTable";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { Pagination } from "@/components/features/shared/Pagination";
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
import { semesterLabel } from "@/lib/format";
import {
  enrollmentService,
  type Enrollment,
  type EnrollmentFilters,
  type Semester,
  type EnrollmentStatus,
} from "@/services/enrollment.service";
import type { PaginatedData } from "@/services/types";

export function EnrollmentsView() {
  const { canWrite } = useAuth();
  const [enrollments, setEnrollments] =
    useState<PaginatedData<Enrollment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<EnrollmentFilters>({
    page: 1,
    per_page: 10,
  });
  const [yearInput, setYearInput] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] =
    useState<Enrollment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Enrollment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextYear = yearInput.trim() || undefined;

      setFilters((current) =>
        current.academic_year === nextYear
          ? current
          : { ...current, academic_year: nextYear, page: 1 },
      );
    }, 350);

    return () => window.clearTimeout(timer);
  }, [yearInput]);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await enrollmentService.getAllEnrollments(filters);

      if (response.status === "success" && response.data) {
        setEnrollments(response.data);
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
    void loadEnrollments();
  }, [loadEnrollments]);

  const resetFilters = () => {
    setYearInput("");
    setFilters({ page: 1, per_page: filters.per_page ?? 10 });
  };

  const openCreate = () => {
    setEditingEnrollment(null);
    setFormOpen(true);
  };

  const openEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await enrollmentService.deleteEnrollment(
        deleteTarget.id,
      );

      if (response.status === "success") {
        toast.success(response.message);
        setDeleteTarget(null);
        await loadEnrollments();
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
        title="Enrollments"
        description="Term-by-term enrollment records, one per student per academic year and semester."
        actions={
          canWrite ? (
            <Button onClick={openCreate}>
              <PlusIcon />
              Add enrollment
            </Button>
          ) : null
        }
      />

      <EnrollmentsFilters
        academicYear={yearInput}
        semester={filters.semester}
        status={filters.status}
        onAcademicYearChange={setYearInput}
        onSemesterChange={(semester: Semester | undefined) =>
          setFilters((current) => ({ ...current, semester, page: 1 }))
        }
        onStatusChange={(status: EnrollmentStatus | undefined) =>
          setFilters((current) => ({ ...current, status, page: 1 }))
        }
        onReset={resetFilters}
      />

      <Card className="overflow-hidden py-0">
        {isLoading ? (
          <TableSkeleton />
        ) : enrollments && enrollments.items.length > 0 ? (
          <>
            <EnrollmentsTable
              enrollments={enrollments.items}
              canWrite={canWrite}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={enrollments.page}
              totalPages={enrollments.total_pages}
              total={enrollments.total}
              perPage={enrollments.per_page}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page }))
              }
              disabled={isLoading}
            />
          </>
        ) : enrollments ? (
          <EmptyState
            icon={GraduationCapIcon}
            title="No enrollments match the filters"
            description="Adjust the search, academic year, semester, or status to see more records."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={GraduationCapIcon}
            title="Enrollments could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button
                variant="outline"
                onClick={() => void loadEnrollments()}
              >
                Retry
              </Button>
            }
          />
        )}
      </Card>

      <EnrollmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        enrollment={editingEnrollment}
        onSaved={() => void loadEnrollments()}
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
            <AlertDialogTitle>Delete enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This removes the ${deleteTarget.academic_year} ${semesterLabel(
                    deleteTarget.semester,
                  )} enrollment record. Linked academic records may be affected.`
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
              Delete enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
