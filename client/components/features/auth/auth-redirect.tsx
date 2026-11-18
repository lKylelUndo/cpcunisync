"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SessionLoader } from "@/components/common/session-loader";
import { useAuth } from "@/context/AuthContext";
import { workspacePath } from "@/lib/workspace";

interface AuthRedirectProps {
  children: ReactNode;
}

/**
 * Sends signed-in users to their workspace and lets guests through to the
 * public landing page. The loader covers session verification and the brief
 * window before an authenticated redirect.
 */
export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    router.replace(workspacePath(user));
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || isAuthenticated) {
    return (
      <SessionLoader className="bg-[#f7f9fc] dark:bg-[#0a1024]" />
    );
  }

  return <>{children}</>;
}
