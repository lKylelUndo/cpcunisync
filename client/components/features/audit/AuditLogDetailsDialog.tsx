"use client";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTimeValue, humanize } from "@/lib/format";
import type { AuditLog } from "@/services/audit.service";

interface AuditLogDetailsDialogProps {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ValueBlock({
  title,
  values,
}: {
  title: string;
  values: Record<string, unknown> | null;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed">
        {values ? JSON.stringify(values, null, 2) : "No values recorded."}
      </pre>
    </div>
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

          <ValueBlock title="Previous values" values={log.old_values} />
          <ValueBlock title="New values" values={log.new_values} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
