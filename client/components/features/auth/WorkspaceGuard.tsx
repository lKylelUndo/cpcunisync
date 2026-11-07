"use client";

import { useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";

import { SessionLoader } from "@/components/common/session-loader";
import { useAuth } from "@/context/AuthContext";
import { workspaceSlugFor } from "@/lib/workspace";

/**
 * Client-side workspace protection for localStorage Bearer-token auth.
 * Requires a session and keeps the URL's workspace segment in sync with the
 * signed-in user's role (admin, registrar, or their department head slug).
 */
export function WorkspaceGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ workspace: string }>();

  const currentWorkspace = params.workspace;
  const expectedWorkspace = workspaceSlugFor(user);

  const isBlocked = !isLoading && !isAuthenticated;
  const isMismatched =
    !isLoading &&
    isAuthenticated &&
    currentWorkspace !== expectedWorkspace;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isMismatched) {
      router.replace(`/${expectedWorkspace}`);
    }
  }, [
    isLoading,
    isAuthenticated,
    isMismatched,
    expectedWorkspace,
    router,
  ]);

  if (isLoading || isBlocked || isMismatched) {
    return <SessionLoader />;
  }

  return <>{children}</>;
}
