import { Suspense } from "react";
import type { Metadata } from "next";

import { NonAdminGuard } from "@/components/features/auth/NonAdminGuard";
import { EnrollmentsView } from "@/components/features/enrollments/enrollments-view";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Enrollments",
};

export default function EnrollmentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NonAdminGuard>
        <EnrollmentsView />
      </NonAdminGuard>
    </Suspense>
  );
}
