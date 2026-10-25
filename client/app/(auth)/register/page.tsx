import { Suspense } from "react";
import type { Metadata } from "next";

import { RegisterView } from "@/components/features/auth/register-view";
import { SpinnerFallback } from "@/components/features/shared/page-skeletons";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<SpinnerFallback />}>
      <RegisterView />
    </Suspense>
  );
}
