import { Suspense } from "react";
import type { Metadata } from "next";

import { DashboardView } from "@/components/features/admin/dashboard-view";
import { DashboardSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
