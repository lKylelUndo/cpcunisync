"use client";

import { useEffect } from "react";
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
import { apiErrorMessage, applyValidationErrors } from "@/lib/api-errors";
import { defaultAcademicYear } from "@/lib/format";
import {
  enrollmentSchema,
  enrollmentService,
  type Enrollment,
  type EnrollmentInput,
} from "@/services/enrollment.service";

const ENROLLMENT_FORM_FIELDS = [
  "student_id",
  "academic_year",
  "semester",
  "status",
  "enrolled_at",
] as const;

interface EnrollmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment?: Enrollment | null;
  fixedStudentId?: number;
  onSaved: () => void;
}

function defaultsFor(
  enrollment: Enrollment | null | undefined,
  fixedStudentId: number | undefined,
): EnrollmentInput {
  return {
    student_id: enrollment?.student_id ?? fixedStudentId ?? 0,
    academic_year: enrollment?.academic_year ?? defaultAcademicYear(),
    semester: enrollment?.semester ?? "1st",
    status: enrollment?.status ?? "enrolled",
    enrolled_at: enrollment?.enrolled_at ?? "",
  };
}

export function EnrollmentFormDialog({
  open,
  onOpenChange,
  enrollment,
  fixedStudentId,
  onSaved,
}: EnrollmentFormDialogProps) {
  const isEditing = Boolean(enrollment);
  const studentIsFixed = Boolean(fixedStudentId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema) as Resolver<EnrollmentInput>,
    defaultValues: defaultsFor(enrollment, fixedStudentId),
  });

  useEffect(() => {
    if (open) {
      reset(defaultsFor(enrollment, fixedStudentId));
    }
  }, [open, enrollment, fixedStudentId, reset]);

  const onSubmit = async (values: EnrollmentInput) => {
    const payload: EnrollmentInput = {
      ...values,
      enrolled_at: values.enrolled_at || null,
    };

    try {
      const response = enrollment
        ? await enrollmentService.updateEnrollment(enrollment.id, payload)
        : await enrollmentService.createEnrollment(payload);

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
          ENROLLMENT_FORM_FIELDS.map(
            (field) => field as keyof EnrollmentInput,
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
              {isEditing ? "Edit enrollment" : "Add enrollment"}
            </DialogTitle>
            <DialogDescription>
              A student can hold one enrollment per academic year and semester.
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
                      onChange={(value) => field.onChange(value ?? 0)}
                      initialStudent={enrollment?.student ?? null}
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

            <div className="space-y-1.5">
              <Label htmlFor="enrollment-year">Academic year</Label>
              <Input
                id="enrollment-year"
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
              <Label htmlFor="enrollment-semester">Semester</Label>
              <Controller
                control={control}
                name="semester"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="enrollment-semester" className="w-full">
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
              <Label htmlFor="enrollment-status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "enrolled"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="enrollment-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="enrolled-at">Enrolled at</Label>
              <Input
                id="enrolled-at"
                type="date"
                {...register("enrolled_at")}
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
              {isEditing ? "Save changes" : "Add enrollment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
