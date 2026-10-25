"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SessionLoader } from "@/components/common/session-loader";
import { useAuth } from "@/context/AuthContext";

export type AuthGuardMode = "GUEST" | "PRIVATE";

interface AuthGuardProps {
  mode?: AuthGuardMode;
  redirectTo?: string;
  children: ReactNode;
}

/**
 * Client-side route protection for localStorage Bearer-token auth.
 * GUEST redirects signed-in users away; PRIVATE requires a session.
 */
export function AuthGuard({
  mode = "PRIVATE",
  redirectTo,
  children,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isBlocked =
    !isLoading &&
    (mode === "PRIVATE" ? !isAuthenticated : isAuthenticated);

  useEffect(() => {
    if (isLoading || !isBlocked) {
      return;
    }

    router.replace(
      redirectTo ?? (mode === "PRIVATE" ? "/login" : "/"),
    );
  }, [isLoading, isBlocked, mode, redirectTo, router]);

  if (isLoading || isBlocked) {
    return <SessionLoader />;
  }

  return <>{children}</>;
}
