import type { ReactNode } from "react";

import { PublicHeader } from "@/components/features/landing/public-header";

/**
 * Shared chrome for the public auth pages. Matches the landing backdrop and
 * wayfinding nav; the page area fills the remaining height so the card stays
 * centered between ribbon and viewport bottom on short and tall screens.
 * The nav is brand-only — the auth forms already link to each other.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[#f7f9fc] text-[#101f4e] selection:bg-[#f0c14b]/40 selection:text-[#101f4e] dark:bg-[#0a1024] dark:text-slate-100 dark:selection:bg-[#d9a51c]/30 dark:selection:text-white">
      <PublicHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
