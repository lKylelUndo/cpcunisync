"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  ShieldCheckIcon,
} from "lucide-react";

import {
  getAdminNavItems,
  getAdminPageTitle,
  isAdminNavItemActive,
  roleLabel,
} from "@/components/features/admin/admin-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = getAdminPageTitle(pathname);
  const readOnly = user?.role === "department_head";
  const navItems = getAdminNavItems(user?.role);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 md:hidden">
          <DropdownMenuLabel>Navigate</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isAdminNavItemActive(pathname, item.href);

            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link
                  href={item.href}
                  className={cn(active && "bg-accent font-medium")}
                >
                  <Icon />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">
          Cordova Public College · Student Information System
        </p>
      </div>

      {readOnly ? (
        <Badge
          variant="outline"
          className="hidden gap-1 border-amber-200 bg-amber-50 text-amber-800 sm:inline-flex dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <ShieldCheckIcon />
          Read-only access
        </Badge>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 gap-2 px-2 sm:px-3"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                {initials(user?.name ?? "CPC UniSync")}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
              {user?.name ?? "Account"}
            </span>
            <Badge variant="secondary" className="hidden md:inline-flex">
              {roleLabel(user?.role)}
            </Badge>
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="space-y-1">
            <span className="block truncate text-sm">{user?.name}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <div className="px-2 pb-1">
            <Badge variant="secondary">{roleLabel(user?.role)}</Badge>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              void logout();
            }}
          >
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
