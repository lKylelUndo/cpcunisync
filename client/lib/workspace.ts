/**
 * Role-scoped workspace routing helpers.
 *
 * Every authenticated user works inside a single workspace root:
 * - admin            -> /admin
 * - registrar        -> /registrar
 * - department_head  -> /{department-code}-department-head (e.g. /cit-department-head)
 */

export interface WorkspaceUser {
  role?: string | null;
  department?: { id?: number; code: string; name?: string } | null;
}

export function workspaceSlugFor(
  user: WorkspaceUser | null | undefined,
): string {
  if (user?.role === "registrar") {
    return "registrar";
  }

  if (user?.role === "department_head") {
    const code = user.department?.code?.trim();

    return code ? `${code.toLowerCase()}-department-head` : "department-head";
  }

  return "admin";
}

export function workspacePath(
  user: WorkspaceUser | null | undefined,
  path = "",
): string {
  return `/${workspaceSlugFor(user)}${path}`;
}

export function workspaceLabel(
  user: WorkspaceUser | null | undefined,
): string {
  switch (user?.role) {
    case "registrar":
      return "Registrar workspace";
    case "department_head":
      return `${user.department?.code ?? "Department"} department workspace`;
    case "admin":
      return "Admin workspace";
    default:
      return "Workspace";
  }
}
