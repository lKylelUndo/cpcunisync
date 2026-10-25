"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { apiErrorMessage, applyValidationErrors } from "@/lib/api-errors";
import type { ProgramLookup } from "@/services/lookup.service";
import {
  studentSchema,
  studentService,
  type Student,
  type StudentInput,
} from "@/services/student.service";

const STUDENT_FORM_FIELDS = [
  "student_number",
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
  "email",
  "phone",
  "sex",
  "birth_date",
  "address",
  "program_id",
  "year_level",
  "status",
] as const;

interface StudentsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  programs: ProgramLookup[];
  onSaved: () => void;
}

function defaultsFor(student?: Student | null): StudentInput {
  return {
    student_number: student?.student_number ?? "",
    first_name: student?.first_name ?? "",
    middle_name: student?.middle_name ?? "",
    last_name: student?.last_name ?? "",
    suffix: student?.suffix ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    sex: student?.sex ?? "male",
    birth_date: student?.birth_date ?? "",
    address: student?.address ?? "",
    program_id: student?.program_id ?? 0,
    year_level: student?.year_level ?? 1,
    status: student?.status ?? "active",
  };
}

export function StudentsFormDialog({
  open,
  onOpenChange,
  student,
  programs,
  onSaved,
}: StudentsFormDialogProps) {
  const isEditing = Boolean(student);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema) as Resolver<StudentInput>,
    defaultValues: defaultsFor(student),
  });

  useEffect(() => {
    if (open) {
      reset(defaultsFor(student));
    }
  }, [open, student, reset]);

  const programId = watch("program_id");
  const selectedProgram = programs.find((program) => program.id === programId);

  const onSubmit = async (values: StudentInput) => {
    const payload: StudentInput = {
      ...values,
      middle_name: values.middle_name || null,
      suffix: values.suffix || null,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
    };

    try {
      const response = student
        ? await studentService.updateStudent(student.id, payload)
        : await studentService.createStudent(payload);

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
          STUDENT_FORM_FIELDS.map((field) => field as keyof StudentInput),
        )
      ) {
        toast.error(apiErrorMessage(error));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit student" : "Create student"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the central record. Changes are written to the audit log."
                : "Add a student to the central registry. The program determines the department."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="student-number">Student number</Label>
              <Input
                id="student-number"
                placeholder="e.g. 2026-00123"
                aria-invalid={Boolean(errors.student_number)}
                {...register("student_number")}
              />
              {errors.student_number ? (
                <p className="text-xs text-destructive">
                  {errors.student_number.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "active"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="student-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                aria-invalid={Boolean(errors.first_name)}
                {...register("first_name")}
              />
              {errors.first_name ? (
                <p className="text-xs text-destructive">
                  {errors.first_name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="middle-name">Middle name</Label>
              <Input id="middle-name" {...register("middle_name")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                aria-invalid={Boolean(errors.last_name)}
                {...register("last_name")}
              />
              {errors.last_name ? (
                <p className="text-xs text-destructive">
                  {errors.last_name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="suffix">Suffix</Label>
              <Input id="suffix" placeholder="Jr., III" {...register("suffix")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-email">Email</Label>
              <Input
                id="student-email"
                type="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-phone">Phone</Label>
              <Input id="student-phone" {...register("phone")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="student-sex">Sex</Label>
              <Controller
                control={control}
                name="sex"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="student-sex" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="birth-date">Birth date</Label>
              <Input
                id="birth-date"
                type="date"
                aria-invalid={Boolean(errors.birth_date)}
                {...register("birth_date")}
              />
              {errors.birth_date ? (
                <p className="text-xs text-destructive">
                  {errors.birth_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="student-program">Program</Label>
              <Controller
                control={control}
                name="program_id"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger
                      id="student-program"
                      className="w-full"
                      aria-invalid={Boolean(errors.program_id)}
                    >
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={String(program.id)}>
                          {program.code} · {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Department:{" "}
                {selectedProgram?.department
                  ? `${selectedProgram.department.code} · ${selectedProgram.department.name}`
                  : "Select a program to resolve the department."}
              </p>
              {errors.program_id ? (
                <p className="text-xs text-destructive">
                  {errors.program_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="year-level">Year level</Label>
              <Controller
                control={control}
                name="year_level"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : "1"}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger id="year-level" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((level) => (
                        <SelectItem key={level} value={String(level)}>
                          Year {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="student-address">Address</Label>
              <Textarea
                id="student-address"
                rows={2}
                {...register("address")}
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
              {isEditing ? "Save changes" : "Create student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
