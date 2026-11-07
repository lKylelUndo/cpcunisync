"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { SessionLoader } from "@/components/common/session-loader";
import { useAuth } from "@/context/AuthContext";
import { workspacePath } from "@/lib/workspace";

/**
 * Restricts an authenticated workspace page to administrators. Non-admin
 * users are sent back to their own workspace root.
 */
export function AdminOnlyGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isLoading || !user || isAdmin) {
      return;
    }

    router.replace(workspacePath(user));
  }, [isLoading, user, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return <SessionLoader />;
  }

  return <>{children}</>;
}
