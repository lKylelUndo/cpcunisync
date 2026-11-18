import Link from "next/link";
import type { ReactNode } from "react";

import { Seal } from "./seal";
import { FOCUS_RING } from "./public-action-styles";

interface PublicHeaderProps {
  /** Right-side nav actions — each public page chooses its own. */
  action?: ReactNode;
}

/**
 * Wayfinding chrome shared by the three public pages (landing, sign in,
 * register). Ribbon + sticky blurred bar with the brand link back to `/`;
 * the right side is supplied by the caller.
 */
export function PublicHeader({ action }: PublicHeaderProps) {
  return (
    <>
      {/* Seal ribbon: red, gold, and royal blue in one hairline */}
      <div
        aria-hidden
        className="h-[3px] w-full bg-linear-to-r from-[#c8102e] via-[#d9a51c] to-[#1e3a8a]"
      />

      <header className="sticky top-0 z-40 border-b border-[#1e3a8a]/10 bg-[#f7f9fc]/95 backdrop-blur dark:border-white/10 dark:bg-[#0a1024]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className={`flex min-w-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80 sm:gap-3 ${FOCUS_RING}`}
          >
            <Seal size="sm" className="size-9 sm:size-10" />
            <span className="truncate text-sm font-semibold tracking-tight text-[#101f4e] sm:text-base dark:text-white">
              CPC UniSync<span aria-hidden className="text-[#d9a51c]">.</span>
            </span>
          </Link>

          {action ? (
            <nav
              aria-label="Account"
              className="flex items-center gap-1.5 sm:gap-2"
            >
              {action}
            </nav>
          ) : null}
        </div>
      </header>
    </>
  );
}
