import { Suspense } from "react";
import type { Metadata } from "next";

import { AuditLogsView } from "@/components/features/audit/audit-logs-view";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Audit Logs",
};

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AuditLogsView />
    </Suspense>
  );
}
