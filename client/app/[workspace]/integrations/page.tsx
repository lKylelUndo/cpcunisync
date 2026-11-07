import { Suspense } from "react";
import type { Metadata } from "next";

import { IntegrationsView } from "@/components/features/integrations/integrations-view";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Integrations",
};

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <IntegrationsView />
    </Suspense>
  );
}
