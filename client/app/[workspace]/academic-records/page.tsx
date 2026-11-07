import { Suspense } from "react";
import type { Metadata } from "next";

import { AcademicRecordsView } from "@/components/features/academic-records/academic-records-view";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Academic Records",
};

export default function AcademicRecordsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AcademicRecordsView />
    </Suspense>
  );
}
