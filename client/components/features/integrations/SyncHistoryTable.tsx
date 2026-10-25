"use client";

import { EyeIcon } from "lucide-react";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { SyncRun } from "@/services/sync.service";

interface SyncHistoryTableProps {
  runs: SyncRun[];
  onView: (run: SyncRun) => void;
}

export function SyncHistoryTable({ runs, onView }: SyncHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Run</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Results</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow key={run.id}>
              <TableCell>
                <p className="font-medium">#{run.id}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTimeValue(run.started_at)}
                </p>
              </TableCell>
              <TableCell>
                {run.department ? (
                  <>
                    <p className="text-sm font-medium">
                      {run.department.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {run.department.name}
                    </p>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Not assigned
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{humanize(run.method)}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={run.status} />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">
                      {run.loaded}
                    </span>{" "}
                    loaded
                  </span>
                  <span>
                    <span className="font-medium text-foreground">
                      {run.updated}
                    </span>{" "}
                    updated
                  </span>
                  <span>
                    <span className="font-medium text-foreground">
                      {run.duplicates}
                    </span>{" "}
                    dup.
                  </span>
                  {run.failed > 0 ? (
                    <span className="text-destructive">
                      <span className="font-medium">{run.failed}</span> failed
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm">
                {durationBetween(run.started_at, run.finished_at)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(run)}
                  >
                    <EyeIcon />
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
