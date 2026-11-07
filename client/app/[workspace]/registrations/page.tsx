import { Suspense } from "react";
import type { Metadata } from "next";

import { RegistrationsView } from "@/components/features/admin/registrations-view";
import { AdminOnlyGuard } from "@/components/features/auth/AdminOnlyGuard";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Account Registrations",
};

export default function RegistrationsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AdminOnlyGuard>
        <RegistrationsView />
      </AdminOnlyGuard>
    </Suspense>
  );
}
