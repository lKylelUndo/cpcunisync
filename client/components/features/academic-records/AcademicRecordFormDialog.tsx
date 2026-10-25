"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { StudentSelect } from "@/components/features/students/StudentSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  academicRecordSchema,
  academicRecordService,
  type AcademicRecord,
  type AcademicRecordInput,
  type AcademicRecordRemarks,
} from "@/services/academic-record.service";
import { enrollmentService, type Enrollment } from "@/services/enrollment.service";
import { apiErrorMessage, applyValidationErrors } from "@/lib/api-errors";
import { defaultAcademicYear, semesterLabel } from "@/lib/format";

const ACADEMIC_RECORD_FORM_FIELDS = [
  "student_id",
  "enrollment_id",
  "subject_code",
  "subject_name",
  "academic_year",
  "semester",
  "grade",
  "remarks",
] as const;

interface AcademicRecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: AcademicRecord | null;
  fixedStudentId?: number;
  onSaved: () => void;
}

function defaultsFor(
  record: AcademicRecord | null | undefined,
  fixedStudentId: number | undefined,
): AcademicRecordInput {
  return {
    student_id: record?.student_id ?? fixedStudentId ?? 0,
    enrollment_id: record?.enrollment_id ?? null,
    subject_code: record?.subject_code ?? "",
    subject_name: record?.subject_name ?? "",
    academic_year: record?.academic_year ?? defaultAcademicYear(),
    semester:
      (record?.semester as AcademicRecordInput["semester"] | undefined) ??
      "1st",
    grade: record?.grade ?? null,
    remarks: record?.remarks ?? null,
  };
}

export function AcademicRecordFormDialog({
  open,
  onOpenChange,
  record,
  fixedStudentId,
  onSaved,
}: AcademicRecordFormDialogProps) {
  const isEditing = Boolean(record);
  const studentIsFixed = Boolean(fixedStudentId);

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AcademicRecordInput>({
    resolver: zodResolver(academicRecordSchema) as Resolver<AcademicRecordInput>,
    defaultValues: defaultsFor(record, fixedStudentId),
  });

  useEffect(() => {
    if (open) {
      reset(defaultsFor(record, fixedStudentId));
    }
  }, [open, record, fixedStudentId, reset]);

  const studentId = watch("student_id");

  useEffect(() => {
    if (!open || !studentId) {
      setEnrollments([]);
      return;
    }

    let active = true;

    const loadEnrollments = async () => {
      setIsLoadingEnrollments(true);

      try {
        const response = await enrollmentService.getAllEnrollments({
          student_id: studentId,
          per_page: 50,
        });

        if (!active) {
          return;
        }

        if (response.status === "success" && response.data) {
          setEnrollments(response.data.items);
        } else {
          setEnrollments([]);
        }
      } catch {
        if (active) {
          setEnrollments([]);
        }
      } finally {
        if (active) {
          setIsLoadingEnrollments(false);
        }
      }
    };

    void loadEnrollments();

    return () => {
      active = false;
    };
  }, [open, studentId]);

  const onSubmit = async (values: AcademicRecordInput) => {
    const payload: AcademicRecordInput = {
      ...values,
      enrollment_id: values.enrollment_id || null,
      grade: values.grade === undefined ? null : values.grade,
      remarks: values.remarks || null,
    };

    try {
      const response = record
        ? await academicRecordService.updateRecord(record.id, payload)
        : await academicRecordService.createRecord(payload);

      if (response.status === "success") {
        toast.success(response.message);
        onOpenChange(false);
        onSaved();
      } else {
        toast.message(response.message);
      }
    } catch (error) {
      if (
        !applyValidationErrors(
          error,
          setError,
          ACADEMIC_RECORD_FORM_FIELDS.map(
            (field) => field as keyof AcademicRecordInput,
          ),
        )
      ) {
        toast.error(apiErrorMessage(error));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit academic record" : "Add academic record"}
            </DialogTitle>
            <DialogDescription>
              Grades are stored per subject. Link the record to an enrollment
              when one matches the same term.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {!studentIsFixed ? (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Student</Label>
                <Controller
                  control={control}
                  name="student_id"
                  render={({ field }) => (
                    <StudentSelect
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value ?? 0);
                        setValue("enrollment_id", null);
                      }}
                      initialStudent={record?.student ?? null}
                    />
                  )}
                />
                {errors.student_id ? (
                  <p className="text-xs text-destructive">
                    {errors.student_id.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="record-enrollment">Enrollment</Label>
              <Controller
                control={control}
                name="enrollment_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : Number(value))
                    }
                    disabled={
                      !studentId || isLoadingEnrollments || enrollments.length === 0
                    }
                  >
                    <SelectTrigger
                      id="record-enrollment"
                      className="w-full"
                      aria-invalid={Boolean(errors.enrollment_id)}
                    >
                      <SelectValue
                        placeholder={
                          !studentId
                            ? "Select a student first"
                            : isLoadingEnrollments
                              ? "Loading enrollments…"
                              : enrollments.length === 0
                                ? "No enrollments for this student"
                                : "Optional"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not linked</SelectItem>
                      {enrollments.map((enrollment) => (
                        <SelectItem
                          key={enrollment.id}
                          value={String(enrollment.id)}
                        >
                          {enrollment.academic_year} ·{" "}
                          {semesterLabel(enrollment.semester)} ·{" "}
                          {enrollment.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.enrollment_id ? (
                <p className="text-xs text-destructive">
                  {errors.enrollment_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-code">Subject code</Label>
              <Input
                id="subject-code"
                placeholder="e.g. IT 101"
                aria-invalid={Boolean(errors.subject_code)}
                {...register("subject_code")}
              />
              {errors.subject_code ? (
                <p className="text-xs text-destructive">
                  {errors.subject_code.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject-name">Subject name</Label>
              <Input
                id="subject-name"
                aria-invalid={Boolean(errors.subject_name)}
                {...register("subject_name")}
              />
              {errors.subject_name ? (
                <p className="text-xs text-destructive">
                  {errors.subject_name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="record-year">Academic year</Label>
              <Input
                id="record-year"
                placeholder="2026-2027"
                aria-invalid={Boolean(errors.academic_year)}
                {...register("academic_year")}
              />
              {errors.academic_year ? (
                <p className="text-xs text-destructive">
                  {errors.academic_year.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="record-semester">Semester</Label>
              <Controller
                control={control}
                name="semester"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="record-semester" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">1st semester</SelectItem>
                      <SelectItem value="2nd">2nd semester</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="record-grade">Grade</Label>
              <Input
                id="record-grade"
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                aria-invalid={Boolean(errors.grade)}
                {...register("grade", {
                  setValueAs: (value) =>
                    value === "" ? null : Number(value),
                })}
              />
              {errors.grade ? (
                <p className="text-xs text-destructive">
                  {errors.grade.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="record-remarks">Remarks</Label>
              <Controller
                control={control}
                name="remarks"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none"
                          ? null
                          : (value as AcademicRecordRemarks),
                      )
                    }
                  >
                    <SelectTrigger id="record-remarks" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No remark</SelectItem>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2Icon className="animate-spin" /> : null}
              {isEditing ? "Save changes" : "Add record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
