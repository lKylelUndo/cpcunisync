import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone =
  | "emerald"
  | "rose"
  | "navy"
  | "amber"
  | "sky"
  | "stone"
  | "indigo"
  | "neutral";

const TONE_CLASSES: Record<StatusTone, string> = {
  emerald:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  rose:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  navy:
    "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  sky:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  stone:
    "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-500/30 dark:bg-stone-500/10 dark:text-stone-300",
  indigo:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
  neutral: "border-border bg-muted text-muted-foreground",
};

const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "emerald" },
  inactive: { label: "Inactive", tone: "stone" },
  graduated: { label: "Graduated", tone: "navy" },
  dropped: { label: "Dropped", tone: "rose" },
  clean: { label: "Clean", tone: "emerald" },
  duplicate_suspect: { label: "Duplicate suspect", tone: "amber" },
  pending_review: { label: "Pending review", tone: "sky" },
  enrolled: { label: "Enrolled", tone: "emerald" },
  completed: { label: "Completed", tone: "indigo" },
  pending: { label: "Pending", tone: "amber" },
  passed: { label: "Passed", tone: "emerald" },
  failed: { label: "Failed", tone: "rose" },
  incomplete: { label: "Incomplete", tone: "amber" },
  ongoing: { label: "Ongoing", tone: "sky" },
  success: { label: "Success", tone: "emerald" },
  partial: { label: "Partial", tone: "amber" },
  failed_run: { label: "Failed", tone: "rose" },
  running: { label: "Running", tone: "sky" },
  updated: { label: "Updated", tone: "sky" },
  created: { label: "Created", tone: "emerald" },
  duplicate: { label: "Duplicate", tone: "amber" },
  info: { label: "Info", tone: "sky" },
  not_run: { label: "No runs", tone: "stone" },
  merged_duplicate: { label: "Merged duplicate", tone: "indigo" },
  dismiss_duplicate: { label: "Dismissed duplicate", tone: "amber" },
  deleted: { label: "Deleted", tone: "rose" },
  login: { label: "Login", tone: "emerald" },
  logout: { label: "Logout", tone: "stone" },
};

function fallbackLabel(status: string): string {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const known = STATUS_MAP[status] ?? {
    label: fallbackLabel(status),
    tone: "neutral" as const,
  };

  return (
    <Badge
      variant="outline"
      className={cn(TONE_CLASSES[known.tone], className)}
    >
      {label ?? known.label}
    </Badge>
  );
}

export function statusTone(status: string): StatusTone {
  return STATUS_MAP[status]?.tone ?? "neutral";
}
