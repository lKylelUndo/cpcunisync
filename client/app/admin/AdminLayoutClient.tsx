"use client";

import type { ReactNode } from "react";

import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";
import { AuthGuard } from "@/components/features/auth/AuthGuard";

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="PRIVATE">
      <div className="flex min-h-svh w-full">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
