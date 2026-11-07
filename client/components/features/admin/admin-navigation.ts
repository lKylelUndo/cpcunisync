import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  BookOpenIcon,
  ClipboardListIcon,
  CopyIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";

import { workspacePath, type WorkspaceUser } from "@/lib/workspace";

export interface WorkspaceNavItem {
  /** Workspace-relative path, e.g. "/students" or "" for the workspace root. */
  path: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Visible to administrators only. */
  adminOnly?: boolean;
  /** Visible to central staff only (administrators and registrars). */
  centralOnly?: boolean;
}

export interface WorkspaceNavLink extends WorkspaceNavItem {
  href: string;
}

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  {
    path: "",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    description: "Institution-wide totals and sync health.",
  },
  {
    path: "/students",
    label: "Students",
    icon: UsersIcon,
    description: "Central student registry and duplicate flags.",
  },
  {
    path: "/registrations",
    label: "Registrations",
    icon: UserCheckIcon,
    description: "Review staff self-registration requests.",
    adminOnly: true,
  },
  {
    path: "/enrollments",
    label: "Enrollments",
    icon: ClipboardListIcon,
    description: "Term enrollment records across departments.",
  },
  {
    path: "/academic-records",
    label: "Academic Records",
    icon: BookOpenIcon,
    description: "Subject grades and remarks per student.",
  },
  {
    path: "/integrations",
    label: "Integrations",
    icon: RefreshCwIcon,
    description: "Department sync runs and ingestion activity.",
    centralOnly: true,
  },
  {
    path: "/duplicates",
    label: "Duplicates",
    icon: CopyIcon,
    description: "Review, dismiss, or merge suspected duplicates.",
    centralOnly: true,
  },
  {
    path: "/audit-logs",
    label: "Audit Logs",
    icon: ScrollTextIcon,
    description: "Trace every write made through the API.",
    centralOnly: true,
  },
  {
    path: "/reports",
    label: "Reports",
    icon: BarChart3Icon,
    description: "Enrollment, academic, and sync summaries.",
  },
];

export function getNavItems(
  user: WorkspaceUser | null | undefined,
): WorkspaceNavLink[] {
  const role = user?.role ?? null;

  return WORKSPACE_NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role !== "admin") {
      return false;
    }

    if (
      item.centralOnly &&
      role !== "admin" &&
      role !== "registrar"
    ) {
      return false;
    }

    return true;
  }).map((item) => ({ ...item, href: workspacePath(user, item.path) }));
}

/** Drops the dynamic workspace segment from a pathname. */
function workspaceRelativePath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return "";
  }

  return `/${segments.slice(1).join("/")}`;
}

export function isWorkspaceNavItemActive(pathname: string, href: string): boolean {
  const current = workspaceRelativePath(pathname);
  const target = workspaceRelativePath(href);

  if (target === "") {
    return current === "";
  }

  return current === target || current.startsWith(`${target}/`);
}

export function getWorkspacePageTitle(pathname: string): string {
  const current = workspaceRelativePath(pathname);

  if (current.startsWith("/students/")) {
    return "Student Profile";
  }

  const match = [...WORKSPACE_NAV_ITEMS]
    .sort((left, right) => right.path.length - left.path.length)
    .find((item) => {
      if (item.path === "") {
        return current === "";
      }

      return current === item.path || current.startsWith(`${item.path}/`);
    });

  return match?.label ?? "Workspace";
}

export function roleLabel(role: string | null | undefined): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "registrar":
      return "Registrar";
    case "department_head":
      return "Department Head";
    default:
      return role ?? "User";
  }
}
