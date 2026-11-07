import { Suspense } from "react";
import type { Metadata } from "next";

import { DuplicatesView } from "@/components/features/duplicates/duplicates-view";
import { ProfileSkeleton } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Duplicates",
};

export default function DuplicatesPage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <DuplicatesView />
    </Suspense>
  );
}
