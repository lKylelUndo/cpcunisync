"use client";

import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  durationBetween,
  formatDateTimeValue,
  humanize,
} from "@/lib/format";
import { syncService, type SyncRun } from "@/services/sync.service";

interface SyncRunDetailsDialogProps {
  runId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COUNTERS = [
  ["extracted", "Extracted"],
  ["loaded", "Loaded"],
  ["updated", "Updated"],
  ["skipped", "Skipped"],
  ["duplicates", "Duplicates"],
  ["failed", "Failed"],
] as const;

export function SyncRunDetailsDialog({
  runId,
  open,
  onOpenChange,
}: SyncRunDetailsDialogProps) {
  const [run, setRun] = useState<SyncRun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !runId) {
      return;
    }

    let active = true;

    const loadRun = async () => {
      setIsLoading(true);
      setError(false);

      try {
        const response = await syncService.getRun(runId);

        if (!active) {
          return;
        }

        if (response.status === "success" && response.data) {
          setRun(response.data);
        } else {
          setError(true);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadRun();

    return () => {
      active = false;
    };
  }, [open, runId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Sync run {runId ? `#${runId}` : ""}
            {run ? (
              <span className="ml-2 align-middle">
                <StatusBadge status={run.status} />
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {run
              ? `${formatDateTimeValue(run.started_at)} · ${humanize(
                  run.method,
                )} · ${durationBetween(run.started_at, run.finished_at)}`
              : "Run details and row-level errors."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error || !run ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            This sync run could not be loaded.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COUNTERS.map(([key, label]) => (
                <div key={key} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {run[key]}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="outline">{humanize(run.method)}</Badge>
              <Badge variant="outline">
                {run.department
                  ? `${run.department.code} · ${run.department.name}`
                  : "No department"}
              </Badge>
              <span className="text-muted-foreground">
                Finished {formatDateTimeValue(run.finished_at)}
              </span>
            </div>

            {run.message ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                {run.message}
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Row errors ({run.sync_errors?.length ?? run.errors_count ?? 0})
                </h3>
              </div>
              {run.sync_errors && run.sync_errors.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-36">Row</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-56">Payload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {run.sync_errors.map((syncError) => (
                        <TableRow key={syncError.id}>
                          <TableCell className="align-top font-mono text-xs">
                            {syncError.row_identifier}
                          </TableCell>
                          <TableCell className="align-top text-sm">
                            {syncError.message}
                          </TableCell>
                          <TableCell className="align-top">
                            <pre className="max-h-32 max-w-56 overflow-auto rounded bg-muted p-2 text-[11px] leading-relaxed">
                              {syncError.payload
                                ? JSON.stringify(syncError.payload, null, 2)
                                : "—"}
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No row-level errors were recorded for this run.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
