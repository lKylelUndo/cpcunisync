import { Suspense } from "react";
import type { Metadata } from "next";

import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { EnrollmentsView } from "@/components/features/enrollments/enrollments-view";

export const metadata: Metadata = {
  title: "Enrollments",
};

export default function EnrollmentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <EnrollmentsView />
    </Suspense>
  );
}
