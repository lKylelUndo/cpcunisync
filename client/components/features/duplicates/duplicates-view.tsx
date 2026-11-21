"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  GitMergeIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { Pagination } from "@/components/features/shared/Pagination";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatDateValue } from "@/lib/format";
import { workspacePath } from "@/lib/workspace";
import {
  studentService,
  type DuplicateGroup,
  type DuplicateGroupsData,
  type DuplicateMatchReason,
  type Student,
} from "@/services/student.service";

const MATCH_REASON_LABELS: Record<DuplicateMatchReason, string> = {
  student_number: "Student number",
  email: "Email",
  "name+birth_date": "Name and birth date",
};

interface PendingAction {
  kind: "merge" | "dismiss";
  group: DuplicateGroup;
}

function studentDetailTitle(student: Student): string {
  return [
    `#${student.id}`,
    student.student_number,
    student.program?.code,
    student.department?.code,
    student.email ? `Email: ${student.email}` : undefined,
    student.birth_date
      ? `Birth date: ${formatDateValue(student.birth_date)}`
      : undefined,
    `Year level: ${student.year_level}`,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}

function TableStudentCell({ student }: { student: Student }) {
  const { user } = useAuth();

  return (
    <div className="min-w-0">
      <Link
        href={workspacePath(user, `/students/${student.id}`)}
        className="font-medium hover:underline"
      >
        {student.full_name}
      </Link>
      <p
        className="mt-0.5 truncate text-xs text-muted-foreground"
        title={studentDetailTitle(student)}
      >
        {student.student_number}
        {student.program ? ` · ${student.program.code}` : ""}
        {student.department ? ` · ${student.department.code}` : ""}
      </p>
    </div>
  );
}

export function DuplicatesView() {
  const { canWrite } = useAuth();
  const [groups, setGroups] = useState<DuplicateGroup[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [isWorking, setIsWorking] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const loadGroups = useCallback(
    async (targetPage: number): Promise<DuplicateGroupsData | null> => {
      setIsLoading(true);

      try {
        const response = await studentService.getDuplicates({
          page: targetPage,
        });

        if (response.status === "success" && response.data) {
          setGroups(response.data.groups);
          setPage(response.data.page);
          setTotalPages(response.data.total_pages);
          setTotal(response.data.total);
          setPerPage(response.data.per_page);

          return response.data;
        }

        toast.error(response.message);
        return null;
      } catch (error) {
        toast.error(apiErrorMessage(error));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadGroups(1);
  }, [loadGroups]);

  const confirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    setIsWorking(true);

    try {
      const response =
        pendingAction.kind === "merge"
          ? await studentService.mergeStudent(
              pendingAction.group.primary.id,
              { duplicate_id: pendingAction.group.duplicate.id },
            )
          : await studentService.dismissDuplicate(
              pendingAction.group.duplicate.id,
            );

      if (response.status === "success") {
        toast.success(response.message);
        setPendingAction(null);

        const refreshed = await loadGroups(page);
        if (refreshed && refreshed.groups.length === 0) {
          await loadGroups(Math.max(1, refreshed.page - 1));
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Duplicate review"
        description="Records flagged during student creation, sync, or REST ingestion."
        actions={
          <Button
            variant="outline"
            onClick={() => void loadGroups(page)}
            disabled={isLoading}
          >
            <RefreshCwIcon className={isLoading ? "animate-spin" : undefined} />
            Refresh
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          Merging moves enrollments and academic records from the suspect to
          the primary where no term conflict exists, then deletes the suspect.
          Dismissing keeps both records and clears the warning.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : groups && groups.length > 0 ? (
        <div className="space-y-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suspect</TableHead>
                <TableHead>Primary record</TableHead>
                <TableHead>Match reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.duplicate.id}>
                  <TableCell>
                    <TableStudentCell student={group.duplicate} />
                  </TableCell>
                  <TableCell>
                    <TableStudentCell student={group.primary} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {MATCH_REASON_LABELS[group.match_reason] ??
                        group.match_reason}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={group.duplicate.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {canWrite ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPendingAction({ kind: "dismiss", group })
                          }
                        >
                          Dismiss flag
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            setPendingAction({ kind: "merge", group })
                          }
                        >
                          <GitMergeIcon />
                          Merge into primary
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!canWrite && (
            <p className="pt-2 text-sm text-muted-foreground">
              Read-only access. Administrators can resolve duplicates.
            </p>
          )}
        </div>
      ) : groups ? (
        <Card>
          <EmptyState
            icon={CheckCircle2Icon}
            title="No duplicate suspects"
            description="Every central student record is currently marked clean."
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="Duplicates could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button variant="outline" onClick={() => void loadGroups(page)}>
                Retry
              </Button>
            }
          />
        </Card>
      )}

      {groups ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          onPageChange={(next) => void loadGroups(next)}
          disabled={isLoading}
        />
      ) : null}

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open && !isWorking) {
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.kind === "merge"
                ? "Merge duplicate student?"
                : "Dismiss duplicate warning?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.kind === "merge"
                ? `This moves non-conflicting enrollments and academic records from ${pendingAction.group.duplicate.full_name} into ${pendingAction.group.primary.full_name}, then permanently deletes the duplicate record.`
                : pendingAction
                  ? `This clears the duplicate flag on ${pendingAction.group.duplicate.full_name} but keeps both student records.`
                  : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWorking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction?.kind === "merge" ? "destructive" : "default"}
              disabled={isWorking}
              onClick={(event) => {
                event.preventDefault();
                void confirmAction();
              }}
            >
              {isWorking ? <Loader2Icon className="animate-spin" /> : null}
              {pendingAction?.kind === "merge" ? "Merge records" : "Dismiss flag"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
