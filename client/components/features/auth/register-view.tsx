"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  GraduationCapIcon,
  Loader2Icon,
  UserPlusIcon,
} from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { AuthGuard } from "@/components/features/auth/AuthGuard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  authService,
  registerSchema,
  type RegisterInput,
  type RegistrationOptions,
  type RegistrationRole,
} from "@/services/auth.service";

const DEFAULT_ROLES: RegistrationRole[] = ["registrar", "department_head"];

const ROLE_LABELS: Record<RegistrationRole, string> = {
  registrar: "Registrar",
  department_head: "Department Head",
};

const REGISTER_FIELDS: (keyof RegisterInput)[] = [
  "name",
  "email",
  "password",
  "password_confirmation",
  "role",
  "department_id",
];

export function RegisterView() {
  const [submitted, setSubmitted] = useState(false);
  const [options, setOptions] = useState<RegistrationOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterInput>,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "registrar",
      department_id: null,
    },
  });

  const role = watch("role");

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setOptionsLoading(true);

      try {
        const response = await authService.getRegistrationOptions();

        if (!active) {
          return;
        }

        if (response.status === "success" && response.data) {
          setOptions(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        if (active) {
          toast.error(apiErrorMessage(error));
        }
      } finally {
        if (active) {
          setOptionsLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const fetchedRoles = (options?.roles ?? []).filter(
    (option): option is RegistrationRole =>
      option === "registrar" || option === "department_head",
  );
  const roleOptions = fetchedRoles.length > 0 ? fetchedRoles : DEFAULT_ROLES;
  const departments = options?.departments ?? [];

  const onSubmit = async (values: RegisterInput) => {
    try {
      const response = await authService.register({
        ...values,
        department_id:
          values.role === "department_head"
            ? (values.department_id ?? null)
            : null,
      });

      if (response.status === "success") {
        toast.success(response.message || "Registration submitted.");
        setSubmitted(true);
        return;
      }

      if (response.source === "emailExists") {
        toast.error("Email already registered.");
        return;
      }

      toast.error(response.message || "Unable to submit registration.");
    } catch (error) {
      if (!applyValidationErrors(error, setError, REGISTER_FIELDS)) {
        toast.error(apiErrorMessage(error));
      }
    }
  };

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <AuthGuard mode="GUEST">
        {submitted ? (
          <Card className="w-full max-w-md border-border/70 shadow-lg">
            <CardHeader className="gap-4">
              <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2Icon className="size-6" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-2xl">Registration submitted</CardTitle>
                <CardDescription>
                  Your account is awaiting verification by an administrator.
                  You will be able to log in after approval.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeftIcon />
                  Back to login
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-border/70 shadow-lg">
            <CardHeader className="gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCapIcon className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Cordova Public College
                  </p>
                  <CardTitle className="text-2xl">Create account</CardTitle>
                </div>
              </div>
              <CardDescription>
                Register a registrar or department head account. An
                administrator must verify it before you can sign in.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full name</Label>
                  <Input
                    id="register-name"
                    autoComplete="name"
                    placeholder="Juan Dela Cruz"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "register-name-error" : undefined
                    }
                    {...register("name")}
                  />
                  {errors.name ? (
                    <p
                      id="register-name-error"
                      className="text-xs text-destructive"
                    >
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="name@cpc.edu.ph"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={
                      errors.email ? "register-email-error" : undefined
                    }
                    {...register("email")}
                  />
                  {errors.email ? (
                    <p
                      id="register-email-error"
                      className="text-xs text-destructive"
                    >
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password
                          ? "register-password-error"
                          : undefined
                      }
                      {...register("password")}
                    />
                    {errors.password ? (
                      <p
                        id="register-password-error"
                        className="text-xs text-destructive"
                      >
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirmation">
                      Confirm password
                    </Label>
                    <Input
                      id="register-confirmation"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      aria-invalid={Boolean(errors.password_confirmation)}
                      aria-describedby={
                        errors.password_confirmation
                          ? "register-confirmation-error"
                          : undefined
                      }
                      {...register("password_confirmation")}
                    />
                    {errors.password_confirmation ? (
                      <p
                        id="register-confirmation-error"
                        className="text-xs text-destructive"
                      >
                        {errors.password_confirmation.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-role">Account role</Label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          const nextRole = value as RegistrationRole;

                          field.onChange(nextRole);

                          if (nextRole !== "department_head") {
                            setValue("department_id", null);
                          }
                        }}
                      >
                        <SelectTrigger
                          id="register-role"
                          className="w-full"
                          aria-invalid={Boolean(errors.role)}
                        >
                          <SelectValue placeholder="Select a role" />
                          {optionsLoading ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : null}
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {ROLE_LABELS[option]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role ? (
                    <p className="text-xs text-destructive">
                      {errors.role.message}
                    </p>
                  ) : null}
                </div>

                {role === "department_head" ? (
                  <div className="space-y-2">
                    <Label htmlFor="register-department">Department</Label>
                    <Controller
                      control={control}
                      name="department_id"
                      render={({ field }) => (
                        <Select
                          value={
                            field.value ? String(field.value) : undefined
                          }
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          disabled={optionsLoading || departments.length === 0}
                        >
                          <SelectTrigger
                            id="register-department"
                            className="w-full"
                            aria-invalid={Boolean(errors.department_id)}
                          >
                            <SelectValue
                              placeholder={
                                optionsLoading
                                  ? "Loading departments…"
                                  : departments.length === 0
                                    ? "No departments available"
                                    : "Select a department"
                              }
                            />
                            {optionsLoading ? (
                              <Loader2Icon className="size-3.5 animate-spin" />
                            ) : null}
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={String(department.id)}
                              >
                                {department.code} · {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.department_id ? (
                      <p className="text-xs text-destructive">
                        {errors.department_id.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserPlusIcon />
                      Submit registration
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </AuthGuard>
    </main>
  );
}
