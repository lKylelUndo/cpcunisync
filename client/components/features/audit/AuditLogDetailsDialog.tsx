"use client";

import type { ReactNode } from "react";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTimeValue, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/services/audit.service";

interface AuditLogDetailsDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DASH = "—";

/** Strings that read like dates, e.g. "2026-11-18T07:15:27.000000Z". */
const DATE_STRING_RE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/** Status words that fit StatusBadge chips; other strings stay plain text. */
const BADGE_STATUS_WORDS = new Set([
  "active",
  "inactive",
  "dropped",
  "graduated",
  "enrolled",
  "completed",
  "pending",
  "verified",
  "rejected",
  "suspended",
  "passed",
  "failed",
  "ongoing",
  "duplicate_suspect",
]);

const MAX_ARRAY_ITEMS = 4;

/** Subtle accent on changed rows; unchanged rows stay quiet. */
const CHANGED_ROW_CLASS = "bg-success/15 dark:bg-success/25";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateString(value: string): boolean {
  return DATE_STRING_RE.test(value);
}

interface FlatEntry {
  path: string;
  value: unknown;
}

/** Flatten nested objects to dotted paths, e.g. `department.code`. */
function flattenObject(
  value: Record<string, unknown>,
  prefix = "",
): FlatEntry[] {
  const entries: FlatEntry[] = [];

  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(child)) {
      entries.push(...flattenObject(child, path));
    } else {
      entries.push({ path, value: child });
    }
  }

  return entries;
}

/** Human-readable text for a value. Never returns "[object Object]". */
function textFor(value: unknown): string {
  if (value === null || value === undefined) {
    return DASH;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? DASH : value.toLocaleString();
  }

  if (typeof value === "string") {
    if (isDateString(value)) {
      const formatted = formatDateTimeValue(value);

      if (formatted !== DASH) {
        return formatted;
      }
    }

    const trimmed = value.trim();

    return trimmed === "" ? DASH : trimmed;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return DASH;
    }

    const shown = value.slice(0, MAX_ARRAY_ITEMS).map(textFor);

    if (value.length > MAX_ARRAY_ITEMS) {
      shown.push(`+${value.length - MAX_ARRAY_ITEMS}`);
    }

    return shown.join(", ");
  }

  if (isPlainObject(value)) {
    const entries = flattenObject(value);

    if (entries.length === 0) {
      return DASH;
    }

    return entries
      .map((entry) => `${entry.path}: ${textFor(entry.value)}`)
      .join("\n");
  }

  return String(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => deepEqual(item, b[index]))
    );
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);

    return (
      keys.length === Object.keys(b).length &&
      keys.every((key) => key in b && deepEqual(a[key], b[key]))
    );
  }

  return false;
}

function isSameValue(a: unknown, b: unknown): boolean {
  return deepEqual(a ?? null, b ?? null);
}

interface ChangeRow {
  key: string;
  label: string;
  previous: unknown;
  next: unknown;
  changed: boolean;
}

/** Union of keys in old_values and new_values, in order of appearance. */
function changeRows(log: AuditLog): ChangeRow[] {
  const oldValues = log.old_values ?? {};
  const newValues = log.new_values ?? {};
  const keys: string[] = [];

  for (const key of Object.keys(oldValues)) {
    keys.push(key);
  }

  for (const key of Object.keys(newValues)) {
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  return keys.map((key) => ({
    key,
    label: humanize(key),
    previous: oldValues[key],
    next: newValues[key],
    changed: !isSameValue(oldValues[key], newValues[key]),
  }));
}

function valueCell(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">{DASH}</span>;
  }

  const status = typeof value === "string" ? value.trim() : "";

  if (status !== "" && BADGE_STATUS_WORDS.has(status)) {
    return <StatusBadge status={status} />;
  }

  return (
    <span
      className="break-words"
      title={
        typeof value === "string" ? value : JSON.stringify(value)
      }
    >
      {textFor(value)}
    </span>
  );
}

export function AuditLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: AuditLogDetailsDialogProps) {
  if (!log) {
    return null;
  }

  const rows = changeRows(log);
  const isWide =
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 640px)").matches;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {humanize(log.action)}
            <StatusBadge status={log.action} />
          </DialogTitle>
          <DialogDescription>
            {formatDateTimeValue(log.created_at)} · {log.model_type}
            {log.model_id ? ` #${log.model_id}` : ""}
            {log.ip_address ? ` · ${log.ip_address}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">
              {log.user?.name ?? "System / unknown user"}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.user?.email ?? "No user account"}
              {log.user?.role ? ` · ${humanize(log.user.role)}` : ""}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Changes</h3>

            {rows.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                No values recorded.
              </p>
            ) : isWide ? (
              <Table aria-label="Field changes">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">Field</TableHead>
                    <TableHead>Previous</TableHead>
                    <TableHead>New</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.key}
                      className={cn(row.changed && CHANGED_ROW_CLASS)}
                    >
                      <TableCell className="w-2/5 font-medium whitespace-normal break-words">
                        {row.label}
                      </TableCell>
                      <TableCell className="whitespace-pre-line break-words">
                        {valueCell(row.previous)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-pre-line break-words",
                          row.changed && "text-success",
                        )}
                      >
                        {valueCell(row.next)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table aria-label="Field changes">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Field</TableHead>
                    <TableHead className="w-1/2">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.key}
                      className={cn(row.changed && CHANGED_ROW_CLASS)}
                    >
                      <TableCell className="font-medium whitespace-normal break-words">
                        {row.label}
                      </TableCell>
                      <TableCell className="whitespace-pre-line break-words">
                        <span className="text-muted-foreground">Previous: </span>
                        {valueCell(row.previous)}
                        <span className="text-muted-foreground"> → </span>
                        {valueCell(row.next)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <details className="mt-2">
              <summary className="list-none cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                View raw data
              </summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Previous values
                  </p>
                  <pre className="max-h-64 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    New values
                  </p>
                  <pre className="max-h-64 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
