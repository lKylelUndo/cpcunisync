import { Suspense } from "react";
import type { Metadata } from "next";

import { NonAdminGuard } from "@/components/features/auth/NonAdminGuard";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { StudentsView } from "@/components/features/students/students-view";

export const metadata: Metadata = {
  title: "Students",
};

export default function StudentsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NonAdminGuard>
        <StudentsView />
      </NonAdminGuard>
    </Suspense>
  );
}
