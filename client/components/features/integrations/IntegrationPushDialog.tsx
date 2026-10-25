"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  SendIcon,
  XCircleIcon,
} from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
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
import { humanize } from "@/lib/format";
import {
  integrationService,
  integrationStudentSchema,
  type IntegrationCandidate,
  type IntegrationStudentData,
  type IntegrationStudentInput,
} from "@/services/integration.service";
import type { ProgramLookup } from "@/services/lookup.service";
import { studentService } from "@/services/student.service";

const INTEGRATION_FORM_FIELDS = [
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

interface PushResult {
  status: "success" | "error";
  message: string;
  source?: string;
  data?: IntegrationStudentData;
}

interface IntegrationPushDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programs: ProgramLookup[];
  onPushed: () => void;
}

function defaults(): IntegrationStudentInput {
  return {
    student_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    phone: "",
    sex: "male",
    birth_date: "",
    address: "",
    program_id: undefined,
    year_level: 1,
    status: "active",
  };
}

export function IntegrationPushDialog({
  open,
  onOpenChange,
  programs,
  onPushed,
}: IntegrationPushDialogProps) {
  const [result, setResult] = useState<PushResult | null>(null);
  const [busyCandidateId, setBusyCandidateId] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IntegrationStudentInput>({
    resolver: zodResolver(
      integrationStudentSchema,
    ) as Resolver<IntegrationStudentInput>,
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (open) {
      reset(defaults());
      setResult(null);
    }
  }, [open, reset]);

  const programId = watch("program_id");
  const selectedProgram = programs.find((program) => program.id === programId);

  const onSubmit = async (values: IntegrationStudentInput) => {
    const payload: IntegrationStudentInput = {
      ...values,
      middle_name: values.middle_name || null,
      suffix: values.suffix || null,
      email: values.email || null,
      phone: values.phone || null,
      address: values.address || null,
    };

    try {
      const response = await integrationService.sendStudent(payload);

      setResult({
        status: response.status,
        message: response.message,
        source: response.source,
        data: response.data,
      });

      if (response.status === "success") {
        toast.success(response.message);
        onPushed();
      } else if (response.source === "duplicate") {
        toast.warning(response.message);
        onPushed();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      if (
        !applyValidationErrors(
          error,
          setError,
          INTEGRATION_FORM_FIELDS.map(
            (field) => field as keyof IntegrationStudentInput,
          ),
        )
      ) {
        toast.error(apiErrorMessage(error));
      }
    }
  };

  const mergeCandidate = async (candidate: IntegrationCandidate) => {
    if (!result?.data) {
      return;
    }

    setBusyCandidateId(candidate.student.id);

    try {
      const response = await studentService.mergeStudent(
        candidate.student.id,
        { duplicate_id: result.data.student.id },
      );

      if (response.status === "success") {
        toast.success(response.message);
        setResult({
          status: "success",
          message: response.message,
          source: "merged",
          data: { student: response.data ?? candidate.student },
        });
        onPushed();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusyCandidateId(null);
    }
  };

  const dismissSuspect = async () => {
    if (!result?.data) {
      return;
    }

    setBusyCandidateId(result.data.student.id);

    try {
      const response = await studentService.dismissDuplicate(
        result.data.student.id,
      );

      if (response.status === "success") {
        toast.success(response.message);
        setResult({
          status: "success",
          message: response.message,
          source: "dismissed",
          data: { student: response.data ?? result.data.student },
        });
        onPushed();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusyCandidateId(null);
    }
  };

  const isDuplicateResult =
    result?.status === "error" &&
    result.source === "duplicate" &&
    Boolean(result.data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {result ? (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isDuplicateResult ? (
                  <AlertTriangleIcon className="size-5 text-amber-600" />
                ) : result.status === "success" ? (
                  <CheckCircle2Icon className="size-5 text-emerald-600" />
                ) : (
                  <XCircleIcon className="size-5 text-destructive" />
                )}
                {isDuplicateResult
                  ? "Potential duplicate detected"
                  : result.status === "success"
                    ? "Integration accepted"
                    : "Integration rejected"}
              </DialogTitle>
              <DialogDescription>{result.message}</DialogDescription>
            </DialogHeader>

            {result.data ? (
              <div className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/students/${result.data.student.id}`}
                    className="font-medium hover:underline"
                  >
                    {result.data.student.full_name}
                  </Link>
                  <StatusBadge status={result.data.student.integrity_status} />
                  {result.source ? (
                    <span className="text-xs text-muted-foreground">
                      · {humanize(result.source)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.data.student.student_number}
                  {result.data.student.program
                    ? ` · ${result.data.student.program.code}`
                    : ""}
                  {result.data.student.department
                    ? ` · ${result.data.student.department.code}`
                    : ""}
                </p>
              </div>
            ) : null}

            {isDuplicateResult && result.data ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900">
                  The incoming record was stored as a duplicate suspect linked
                  to{" "}
                  {result.data.student.duplicate_of_id
                    ? `primary student #${result.data.student.duplicate_of_id}`
                    : "an existing student"}
                  . Review the candidates below before merging or dismissing.
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Candidates ({result.data.candidates?.length ?? 0})
                  </h3>
                  {(result.data.candidates ?? []).map((candidate) => {
                    const isLinkedPrimary =
                      result.data?.student.duplicate_of_id ===
                      candidate.student.id;

                    return (
                      <div
                        key={candidate.student.id}
                        className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <Link
                            href={`/admin/students/${candidate.student.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {candidate.student.full_name} (
                            {candidate.student.student_number})
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Match: {humanize(candidate.match_reason)}
                            {isLinkedPrimary ? " · linked primary" : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={`/admin/students/${candidate.student.id}`}
                            >
                              View
                            </Link>
                          </Button>
                          {isLinkedPrimary ? (
                            <Button
                              size="sm"
                              disabled={busyCandidateId !== null}
                              onClick={() => void mergeCandidate(candidate)}
                            >
                              {busyCandidateId === candidate.student.id ? (
                                <Loader2Icon className="animate-spin" />
                              ) : null}
                              Merge into this
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={busyCandidateId !== null}
                  onClick={() => void dismissSuspect()}
                >
                  {busyCandidateId === result.data.student.id ? (
                    <Loader2Icon className="animate-spin" />
                  ) : null}
                  Dismiss duplicate flag
                </Button>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  reset(defaults());
                  setResult(null);
                }}
              >
                Send another
              </Button>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <DialogHeader>
              <DialogTitle>Push a student through REST</DialogTitle>
              <DialogDescription>
                Simulates a department REST integration. The server resolves
                the program, detects duplicates, and records the push as a sync
                run.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="push-number">Student number</Label>
                <Input
                  id="push-number"
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
                <Label htmlFor="push-status">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "active"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="push-status" className="w-full">
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
                <Label htmlFor="push-first">First name</Label>
                <Input
                  id="push-first"
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
                <Label htmlFor="push-middle">Middle name</Label>
                <Input id="push-middle" {...register("middle_name")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="push-last">Last name</Label>
                <Input
                  id="push-last"
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
                <Label htmlFor="push-suffix">Suffix</Label>
                <Input id="push-suffix" {...register("suffix")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="push-email">Email</Label>
                <Input
                  id="push-email"
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
                <Label htmlFor="push-phone">Phone</Label>
                <Input id="push-phone" {...register("phone")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="push-sex">Sex</Label>
                <Controller
                  control={control}
                  name="sex"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="push-sex" className="w-full">
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
                <Label htmlFor="push-birth">Birth date</Label>
                <Input
                  id="push-birth"
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
                <Label htmlFor="push-program">Program</Label>
                <Controller
                  control={control}
                  name="program_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) =>
                        field.onChange(Number(value))
                      }
                    >
                      <SelectTrigger
                        id="push-program"
                        className="w-full"
                        aria-invalid={Boolean(errors.program_id)}
                      >
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((program) => (
                          <SelectItem
                            key={program.id}
                            value={String(program.id)}
                          >
                            {program.code} · {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedProgram?.department
                    ? `Department: ${selectedProgram.department.code} · ${selectedProgram.department.name}`
                    : "The program determines the department."}
                </p>
                {errors.program_id ? (
                  <p className="text-xs text-destructive">
                    {errors.program_id.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="push-year">Year level</Label>
                <Controller
                  control={control}
                  name="year_level"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : "1"}
                      onValueChange={(value) =>
                        field.onChange(Number(value))
                      }
                    >
                      <SelectTrigger id="push-year" className="w-full">
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

              <div className="space-y-1.5">
                <Label htmlFor="push-address">Address</Label>
                <Textarea id="push-address" rows={2} {...register("address")} />
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
                {isSubmitting ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SendIcon />
                )}
                Push student
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
