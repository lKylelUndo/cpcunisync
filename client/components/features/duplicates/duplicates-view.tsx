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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatDateValue } from "@/lib/format";
import {
  studentService,
  type DuplicateGroup,
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

function StudentMiniCard({
  student,
  role,
}: {
  student: Student;
  role: "primary" | "duplicate";
}) {
  return (
    <div
      className={
        role === "primary"
          ? "rounded-lg border bg-muted/30 p-4"
          : "rounded-lg border border-amber-200 bg-amber-50/50 p-4"
      }
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant={role === "primary" ? "secondary" : "outline"}>
          {role === "primary" ? "Primary record" : "Duplicate suspect"}
        </Badge>
        <StatusBadge status={student.status} />
      </div>
      <Link
        href={`/admin/students/${student.id}`}
        className="font-medium hover:underline"
      >
        {student.full_name}
      </Link>
      <p className="text-sm text-muted-foreground">
        {student.student_number}
        {student.program ? ` · ${student.program.code}` : ""}
        {student.department ? ` · ${student.department.code}` : ""}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate">{student.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Birth date</dt>
          <dd>{formatDateValue(student.birth_date)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Year level</dt>
          <dd>Year {student.year_level}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Record ID</dt>
          <dd>#{student.id}</dd>
        </div>
      </dl>
      <Button asChild variant="outline" size="sm" className="mt-3">
        <Link href={`/admin/students/${student.id}`}>
          Open student record
        </Link>
      </Button>
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

  const loadGroups = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await studentService.getDuplicates();

      if (response.status === "success" && response.data) {
        setGroups(response.data.groups);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
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
        await loadGroups();
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
            onClick={() => void loadGroups()}
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
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-44 w-full" />
                <Skeleton className="h-44 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.duplicate.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <UsersIcon className="size-4 text-muted-foreground" />
                      {group.duplicate.full_name}
                    </CardTitle>
                    <CardDescription>
                      Matched with {group.primary.full_name} by{" "}
                      {MATCH_REASON_LABELS[group.match_reason] ??
                        group.match_reason}
                      .
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Duplicate</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <StudentMiniCard student={group.primary} role="primary" />
                  <StudentMiniCard
                    student={group.duplicate}
                    role="duplicate"
                  />
                </div>

                {canWrite ? (
                  <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPendingAction({ kind: "dismiss", group })
                      }
                    >
                      Dismiss flag
                    </Button>
                    <Button
                      onClick={() => setPendingAction({ kind: "merge", group })}
                    >
                      <GitMergeIcon />
                      Merge into primary
                    </Button>
                  </div>
                ) : (
                  <p className="border-t pt-4 text-sm text-muted-foreground">
                    Read-only access. Administrators can resolve duplicates.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
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
              <Button variant="outline" onClick={() => void loadGroups()}>
                Retry
              </Button>
            }
          />
        </Card>
      )}

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
