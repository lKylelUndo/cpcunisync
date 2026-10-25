import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  BookOpenIcon,
  ClipboardListIcon,
  CopyIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  UsersIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    description: "Institution-wide totals and sync health.",
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: UsersIcon,
    description: "Central student registry and duplicate flags.",
  },
  {
    href: "/admin/enrollments",
    label: "Enrollments",
    icon: ClipboardListIcon,
    description: "Term enrollment records across departments.",
  },
  {
    href: "/admin/academic-records",
    label: "Academic Records",
    icon: BookOpenIcon,
    description: "Subject grades and remarks per student.",
  },
  {
    href: "/admin/integrations",
    label: "Integrations",
    icon: RefreshCwIcon,
    description: "Department sync runs and REST push activity.",
  },
  {
    href: "/admin/duplicates",
    label: "Duplicates",
    icon: CopyIcon,
    description: "Review, dismiss, or merge suspected duplicates.",
  },
  {
    href: "/admin/audit-logs",
    label: "Audit Logs",
    icon: ScrollTextIcon,
    description: "Trace every write made through the API.",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: BarChart3Icon,
    description: "Enrollment, academic, and sync summaries.",
  },
];

export function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/students/")) {
    return "Student Profile";
  }

  const match = [...ADMIN_NAV_ITEMS]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => isAdminNavItemActive(pathname, item.href));

  return match?.label ?? "Admin";
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
