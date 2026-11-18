"use client";

import { AuthGuard } from "@/components/features/auth/AuthGuard";
import { LoginForm } from "@/components/features/auth/LoginForm";

export function LoginView() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <AuthGuard mode="GUEST">
        <LoginForm />
      </AuthGuard>
    </main>
  );
}
