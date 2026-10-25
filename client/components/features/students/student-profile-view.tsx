"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  Loader2Icon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { AcademicRecordFormDialog } from "@/components/features/academic-records/AcademicRecordFormDialog";
import { EnrollmentFormDialog } from "@/components/features/enrollments/EnrollmentFormDialog";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { StudentsFormDialog } from "@/components/features/students/StudentsFormDialog";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  formatDateValue,
  formatDateTimeValue,
  formatGrade,
  semesterLabel,
} from "@/lib/format";
import {
  academicRecordService,
  type AcademicRecord,
} from "@/services/academic-record.service";
import {
  enrollmentService,
  type Enrollment,
} from "@/services/enrollment.service";
import {
  lookupService,
  type ProgramLookup,
} from "@/services/lookup.service";
import { studentService, type Student } from "@/services/student.service";

const SEMESTER_ORDER: Record<string, number> = {
  "1st": 1,
  "2nd": 2,
  summer: 3,
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm sm:text-right">{value}</dd>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function StudentProfileView({ studentId: studentIdParam }: { studentId: string }) {
  const router = useRouter();
  const { canWrite } = useAuth();
  const studentId = Number(studentIdParam);

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [programs, setPrograms] = useState<ProgramLookup[]>([]);

  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [enrollmentFormOpen, setEnrollmentFormOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] =
    useState<Enrollment | null>(null);
  const [deleteEnrollment, setDeleteEnrollment] =
    useState<Enrollment | null>(null);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(
    null,
  );
  const [deleteRecord, setDeleteRecord] = useState<AcademicRecord | null>(null);
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadStudent = useCallback(async () => {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(false);

    try {
      const response = await studentService.getStudent(studentId);

      if (response.status === "success" && response.data) {
        setStudent(response.data);
      } else {
        setLoadError(true);
        toast.error(response.message);
      }
    } catch (error) {
      setLoadError(true);
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  useEffect(() => {
    if (!canWrite) {
      return;
    }

    let active = true;

    const loadPrograms = async () => {
      try {
        const response = await lookupService.getPrograms();

        if (active && response.status === "success" && response.data) {
          setPrograms(response.data);
        }
      } catch {
        // The student form surfaces its own validation if programs are missing.
      }
    };

    void loadPrograms();

    return () => {
      active = false;
    };
  }, [canWrite]);

  const confirmDeleteStudent = async () => {
    if (!student) {
      return;
    }

    setBusy(true);

    try {
      const response = await studentService.deleteStudent(student.id);

      if (response.status === "success") {
        toast.success(response.message);
        router.push("/admin/students");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteEnrollment = async () => {
    if (!deleteEnrollment) {
      return;
    }

    setBusy(true);

    try {
      const response = await enrollmentService.deleteEnrollment(
        deleteEnrollment.id,
      );

      if (response.status === "success") {
        toast.success(response.message);
        setDeleteEnrollment(null);
        await loadStudent();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteRecord = async () => {
    if (!deleteRecord) {
      return;
    }

    setBusy(true);

    try {
      const response = await academicRecordService.deleteRecord(
        deleteRecord.id,
      );

      if (response.status === "success") {
        toast.success(response.message);
        setDeleteRecord(null);
        await loadStudent();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <SectionSkeleton />
          </Card>
          <Card className="p-6">
            <SectionSkeleton />
          </Card>
        </div>
        <Card className="p-6">
          <SectionSkeleton />
        </Card>
      </div>
    );
  }

  if (!student || loadError) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/students">
            <ArrowLeftIcon />
            Back to students
          </Link>
        </Button>
        <Card>
          <EmptyState
            icon={GraduationCapIcon}
            title="Student not found"
            description="The record may have been removed, merged, or the identifier is invalid."
            action={
              <Button variant="outline" onClick={() => void loadStudent()}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const enrollments = [...(student.enrollments ?? [])].sort((a, b) => {
    if (a.academic_year !== b.academic_year) {
      return a.academic_year < b.academic_year ? 1 : -1;
    }

    return (
      (SEMESTER_ORDER[b.semester] ?? 0) - (SEMESTER_ORDER[a.semester] ?? 0)
    );
  });

  const records = [...(student.academic_records ?? [])].sort((a, b) => {
    if (a.academic_year !== b.academic_year) {
      return a.academic_year < b.academic_year ? 1 : -1;
    }

    return (
      (SEMESTER_ORDER[b.semester] ?? 0) - (SEMESTER_ORDER[a.semester] ?? 0)
    );
  });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/students">
          <ArrowLeftIcon />
          Back to students
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {student.full_name}
            </h1>
            <StatusBadge status={student.status} />
            {student.integrity_status === "duplicate_suspect" ? (
              <StatusBadge status={student.integrity_status} />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {student.student_number}
            {student.program
              ? ` · ${student.program.code} · ${student.department?.code ?? "No department"}`
              : " · No program assigned"}
            {` · Year ${student.year_level}`}
          </p>
        </div>

        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setStudentFormOpen(true)}
            >
              <PencilIcon />
              Edit student
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteStudentOpen(true)}
            >
              <Trash2Icon />
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {student.integrity_status === "duplicate_suspect" ? (
        <Card className="border-amber-200 bg-amber-50/70 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-amber-900">
                Flagged as a possible duplicate
              </p>
              <p className="text-amber-800">
                {student.duplicate_of_id
                  ? `This record is linked to primary student #${student.duplicate_of_id}. Review both records before merging or dismissing.`
                  : "This record matched another student during integrity checks."}
              </p>
              <Link
                href="/admin/duplicates"
                className="inline-block font-medium text-amber-900 underline underline-offset-4"
              >
                Review duplicates
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>
              Contact information and demographic data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow
                label="Email"
                value={
                  student.email ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MailIcon className="size-3.5 text-muted-foreground" />
                      {student.email}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow
                label="Phone"
                value={
                  student.phone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <PhoneIcon className="size-3.5 text-muted-foreground" />
                      {student.phone}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow
                label="Sex"
                value={student.sex.charAt(0).toUpperCase() + student.sex.slice(1)}
              />
              <DetailRow
                label="Birth date"
                value={
                  student.birth_date ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDaysIcon className="size-3.5 text-muted-foreground" />
                      {formatDateValue(student.birth_date)}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow
                label="Address"
                value={
                  student.address ? (
                    <span className="inline-flex items-start gap-1.5 sm:justify-end">
                      <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <span className="sm:max-w-64">{student.address}</span>
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic profile</CardTitle>
            <CardDescription>
              Program placement and record provenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow
                label="Program"
                value={
                  student.program
                    ? `${student.program.code} · ${student.program.name}`
                    : "Not assigned"
                }
              />
              <DetailRow
                label="Department"
                value={
                  student.department
                    ? `${student.department.code} · ${student.department.name}`
                    : "Not assigned"
                }
              />
              <DetailRow
                label="Year level"
                value={`Year ${student.year_level}`}
              />
              <DetailRow
                label="Source"
                value={
                  student.source
                    ? student.source.charAt(0).toUpperCase() +
                      student.source.slice(1)
                    : "—"
                }
              />
              <DetailRow
                label="Created"
                value={formatDateTimeValue(student.created_at)}
              />
              <DetailRow
                label="Last updated"
                value={formatDateTimeValue(student.updated_at)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Enrollment history</h2>
            <p className="text-sm text-muted-foreground">
              {enrollments.length} enrollment
              {enrollments.length === 1 ? "" : "s"} on record.
            </p>
          </div>
          {canWrite ? (
            <Button
              size="sm"
              onClick={() => {
                setEditingEnrollment(null);
                setEnrollmentFormOpen(true);
              }}
            >
              <PlusIcon />
              Add enrollment
            </Button>
          ) : null}
        </div>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={GraduationCapIcon}
            title="No enrollments yet"
            description="Create the first term enrollment for this student."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled at</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.academic_year}
                    </TableCell>
                    <TableCell>{semesterLabel(enrollment.semester)}</TableCell>
                    <TableCell>
                      <StatusBadge status={enrollment.status} />
                    </TableCell>
                    <TableCell>
                      {formatDateValue(enrollment.enrolled_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {canWrite ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit enrollment"
                              onClick={() => {
                                setEditingEnrollment(enrollment);
                                setEnrollmentFormOpen(true);
                              }}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete enrollment"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteEnrollment(enrollment)}
                            >
                              <Trash2Icon />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Academic records</h2>
            <p className="text-sm text-muted-foreground">
              {records.length} subject record{records.length === 1 ? "" : "s"}{" "}
              on file.
            </p>
          </div>
          {canWrite ? (
            <Button
              size="sm"
              onClick={() => {
                setEditingRecord(null);
                setRecordFormOpen(true);
              }}
            >
              <PlusIcon />
              Add record
            </Button>
          ) : null}
        </div>
        {records.length === 0 ? (
          <EmptyState
            icon={BookOpenIcon}
            title="No academic records yet"
            description="Add subject grades after the student is enrolled."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-medium">{record.subject_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.subject_name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{record.academic_year}</p>
                      <p className="text-xs text-muted-foreground">
                        {semesterLabel(record.semester)}
                      </p>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatGrade(record.grade)}
                    </TableCell>
                    <TableCell>
                      {record.remarks ? (
                        <StatusBadge status={record.remarks} />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {canWrite ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit academic record"
                              onClick={() => {
                                setEditingRecord(record);
                                setRecordFormOpen(true);
                              }}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete academic record"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteRecord(record)}
                            >
                              <Trash2Icon />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <StudentsFormDialog
        open={studentFormOpen}
        onOpenChange={setStudentFormOpen}
        student={student}
        programs={programs}
        onSaved={() => void loadStudent()}
      />

      <EnrollmentFormDialog
        open={enrollmentFormOpen}
        onOpenChange={setEnrollmentFormOpen}
        enrollment={editingEnrollment}
        fixedStudentId={student.id}
        onSaved={() => void loadStudent()}
      />

      <AcademicRecordFormDialog
        open={recordFormOpen}
        onOpenChange={setRecordFormOpen}
        record={editingRecord}
        fixedStudentId={student.id}
        onSaved={() => void loadStudent()}
      />

      <AlertDialog
        open={Boolean(deleteEnrollment)}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setDeleteEnrollment(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete enrollment?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteEnrollment
                ? `Remove the ${deleteEnrollment.academic_year} ${semesterLabel(
                    deleteEnrollment.semester,
                  )} enrollment?`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteEnrollment();
              }}
            >
              {busy ? <Loader2Icon className="animate-spin" /> : null}
              Delete enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteRecord)}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setDeleteRecord(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete academic record?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRecord
                ? `Remove the ${deleteRecord.subject_code} record for ${student.full_name}?`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteRecord();
              }}
            >
              {busy ? <Loader2Icon className="animate-spin" /> : null}
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteStudentOpen}
        onOpenChange={(open) => {
          if (!busy) {
            setDeleteStudentOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete student record?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {student.full_name} (
              {student.student_number}) and may affect linked enrollments and
              academic records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteStudent();
              }}
            >
              {busy ? <Loader2Icon className="animate-spin" /> : null}
              Delete student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
