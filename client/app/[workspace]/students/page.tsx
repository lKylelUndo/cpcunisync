import { Suspense } from "react";
import type { Metadata } from "next";

import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { StudentsView } from "@/components/features/students/students-view";

export const metadata: Metadata = {
  title: "Students",
};

export default function StudentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <StudentsView />
    </Suspense>
  );
}
