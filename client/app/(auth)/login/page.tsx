import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginView } from "@/components/features/auth/login-view";
import { SpinnerFallback } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<SpinnerFallback />}>
      <LoginView />
    </Suspense>
  );
}
