"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  Loader2Icon,
  LockKeyholeIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";

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
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginInput } from "@/services/auth.service";
import type { ApiValidationError } from "@/services/types";

const LOGIN_FIELDS = new Set<keyof LoginInput>([
  "email",
  "password",
  "device_name",
]);

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    try {
      await login({ ...values, device_name: "cpc-web" });
    } catch (error) {
      if (
        isAxiosError<ApiValidationError>(error) &&
        error.response?.status === 422
      ) {
        const body = error.response.data;

        for (const [field, messages] of Object.entries(body.errors ?? {})) {
          if (LOGIN_FIELDS.has(field as keyof LoginInput)) {
            setError(field as keyof LoginInput, {
              type: "server",
              message: messages[0] ?? body.message,
            });
          }
        }
      }
    }
  };

  return (
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
            <CardTitle className="text-2xl">CPC UniSync</CardTitle>
          </div>
        </div>
        <CardDescription>
          Sign in with your registrar or department account to manage student
          records, enrollments, and sync runs.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@cpc.edu.ph"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p id="email-error" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pr-10"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>
            {errors.password ? (
              <p id="password-error" className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LockKeyholeIcon />
                Sign in
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Need a staff account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
