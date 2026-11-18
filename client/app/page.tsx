import { Suspense } from "react";

import { AuthRedirect } from "@/components/features/auth/auth-redirect";
import { LandingPage } from "@/components/features/landing/landing-page";
import { SpinnerFallback } from "@/components/features/shared/page-skeletons";

export default function HomePage() {
  return (
    <Suspense fallback={<SpinnerFallback />}>
      <AuthRedirect>
        <LandingPage />
      </AuthRedirect>
    </Suspense>
  );
}
