import { Suspense } from "react";
import type { Metadata } from "next";

import { NonAdminGuard } from "@/components/features/auth/NonAdminGuard";
import { IntegrationsView } from "@/components/features/integrations/integrations-view";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Integrations",
};

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NonAdminGuard>
        <IntegrationsView />
      </NonAdminGuard>
    </Suspense>
  );
}
