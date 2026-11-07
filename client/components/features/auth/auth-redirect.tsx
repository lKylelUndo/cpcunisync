"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SessionLoader } from "@/components/common/session-loader";
import { useAuth } from "@/context/AuthContext";
import { workspacePath } from "@/lib/workspace";

export function AuthRedirect() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(isAuthenticated ? workspacePath(user) : "/login");
  }, [isLoading, isAuthenticated, user, router]);

  return <SessionLoader />;
}
