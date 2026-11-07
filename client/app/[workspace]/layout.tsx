import { Suspense } from "react";
import type { Metadata } from "next";

import { SessionLoader } from "@/components/common/session-loader";
import { AdminHeader } from "@/components/features/admin/AdminHeader";
import { WorkspaceSidebar } from "@/components/features/admin/WorkspaceSidebar";
import { WorkspaceGuard } from "@/components/features/auth/WorkspaceGuard";

export const metadata: Metadata = {
  title: "Workspace",
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<SessionLoader />}>
        <WorkspaceGuard>
          <div className="flex min-h-svh w-full">
            <WorkspaceSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AdminHeader />
              <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className="mx-auto w-full max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </WorkspaceGuard>
      </Suspense>
    </div>
  );
}
