"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCapIcon } from "lucide-react";

import {
  ADMIN_NAV_ITEMS,
  isAdminNavItemActive,
} from "@/components/features/admin/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh w-16 shrink-0 flex-col border-r bg-sidebar md:flex lg:w-64">
      <div className="flex h-16 shrink-0 items-center justify-center gap-3 border-b border-sidebar-border px-3 lg:justify-start lg:px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCapIcon className="size-5" />
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold">CPC UniSync</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Admin workspace
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 lg:p-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isAdminNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm transition-colors lg:justify-start",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
                />
              ) : null}
              <Icon className="size-4 shrink-0" />
              <span className="hidden truncate lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden shrink-0 border-t border-sidebar-border p-4 lg:block">
        <p className="text-xs font-medium">Cordova Public College</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Student Information System
        </p>
      </div>
    </aside>
  );
}
