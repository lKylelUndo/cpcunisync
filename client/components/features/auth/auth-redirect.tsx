"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SessionLoader } from "@/components/common/session-loader";

export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");

    router.replace(token ? "/admin" : "/login");
  }, [router]);

  return <SessionLoader />;
}
