import { Suspense } from "react";
import type { Metadata } from "next";

import { ReportsView } from "@/components/features/reports/reports-view";
import { ReportsSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsView />
    </Suspense>
  );
}
