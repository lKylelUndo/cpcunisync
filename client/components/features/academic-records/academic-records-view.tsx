"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpenIcon, Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { AcademicRecordFormDialog } from "@/components/features/academic-records/AcademicRecordFormDialog";
import {
  AcademicRecordsFilters,
  type AcademicRecordSemester,
} from "@/components/features/academic-records/AcademicRecordsFilters";
import { AcademicRecordsTable } from "@/components/features/academic-records/AcademicRecordsTable";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
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
import {
  academicRecordService,
  type AcademicRecord,
  type AcademicRecordFilters,
  type AcademicRecordRemarks,
} from "@/services/academic-record.service";
import type { PaginatedData } from "@/services/types";

export function AcademicRecordsView() {
  const { canWrite } = useAuth();
  const [records, setRecords] =
    useState<PaginatedData<AcademicRecord> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AcademicRecordFilters>({
    page: 1,
    per_page: 10,
  });
  const [search, setSearch] = useState("");
  const [yearInput, setYearInput] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AcademicRecord | null>(null);
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

  const loadRecords = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await academicRecordService.getAllRecords(filters);

      if (response.status === "success" && response.data) {
        setRecords(response.data);
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
    void loadRecords();
  }, [loadRecords]);

  const resetFilters = () => {
    setSearch("");
    setYearInput("");
    setFilters({ page: 1, per_page: filters.per_page ?? 10 });
  };

  const openCreate = () => {
    setEditingRecord(null);
    setFormOpen(true);
  };

  const openEdit = (record: AcademicRecord) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await academicRecordService.deleteRecord(
        deleteTarget.id,
      );

      if (response.status === "success") {
        toast.success(response.message);
        setDeleteTarget(null);
        await loadRecords();
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
        title="Academic records"
        description="Subject-level grades and remarks, stored per student and term."
        actions={
          canWrite ? (
            <Button onClick={openCreate}>
              <PlusIcon />
              Add record
            </Button>
          ) : null
        }
      />

      <AcademicRecordsFilters
        search={search}
        academicYear={yearInput}
        semester={filters.semester}
        remarks={filters.remarks}
        onSearchChange={setSearch}
        onAcademicYearChange={setYearInput}
        onSemesterChange={(semester: AcademicRecordSemester | undefined) =>
          setFilters((current) => ({ ...current, semester, page: 1 }))
        }
        onRemarksChange={(remarks: AcademicRecordRemarks | undefined) =>
          setFilters((current) => ({ ...current, remarks, page: 1 }))
        }
        onReset={resetFilters}
      />

      <Card className="overflow-hidden py-0">
        {isLoading ? (
          <TableSkeleton />
        ) : records && records.items.length > 0 ? (
          <>
            <AcademicRecordsTable
              records={records.items}
              canWrite={canWrite}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={records.page}
              totalPages={records.total_pages}
              total={records.total}
              perPage={records.per_page}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page }))
              }
              disabled={isLoading}
            />
          </>
        ) : records ? (
          <EmptyState
            icon={BookOpenIcon}
            title="No academic records match the filters"
            description="Adjust the search, term, or remarks to see more records."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BookOpenIcon}
            title="Academic records could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button variant="outline" onClick={() => void loadRecords()}>
                Retry
              </Button>
            }
          />
        )}
      </Card>

      <AcademicRecordFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editingRecord}
        onSaved={() => void loadRecords()}
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
            <AlertDialogTitle>Delete academic record?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This permanently removes the ${deleteTarget.subject_code} record for ${deleteTarget.student?.full_name ?? `student #${deleteTarget.student_id}`}.`
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
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
