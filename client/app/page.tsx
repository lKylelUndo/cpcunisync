import { Suspense } from "react";

import { AuthRedirect } from "@/components/features/auth/auth-redirect";
import { SpinnerFallback } from "@/components/features/shared/page-skeletons";

export default function HomePage() {
  return (
    <Suspense fallback={<SpinnerFallback />}>
      <AuthRedirect />
    </Suspense>
  );
}
