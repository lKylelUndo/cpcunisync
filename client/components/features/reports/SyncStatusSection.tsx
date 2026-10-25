"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  RefreshCwIcon,
} from "lucide-react";
import { toast } from "sonner";

import { StatsCard } from "@/components/features/admin/StatsCard";
import { BarList } from "@/components/features/shared/BarList";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatDateTimeValue } from "@/lib/format";
import {
  reportService,
  type SyncStatusReport,
} from "@/services/report.service";

export function SyncStatusSection() {
  const [report, setReport] = useState<SyncStatusReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setFailed(false);

    try {
      const response = await reportService.getSyncStatus();

      if (response.status === "success" && response.data) {
        setReport(response.data);
      } else {
        setFailed(true);
        toast.error(response.message);
      }
    } catch (error) {
      setFailed(true);
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (failed || !report) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          The sync status report could not be loaded.
        </p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => void loadReport()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  const successRate = report.totals.runs
    ? Math.round((report.totals.success / report.totals.runs) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total runs"
          value={report.totals.runs.toLocaleString()}
          icon={DatabaseIcon}
          hint={`${successRate}% completed successfully`}
        />
        <StatsCard
          label="Successful"
          value={report.totals.success.toLocaleString()}
          icon={CheckCircle2Icon}
          hint={`${report.totals.partial} partial`}
        />
        <StatsCard
          label="Failed runs"
          value={report.totals.failed.toLocaleString()}
          icon={AlertTriangleIcon}
          hint="Across all departments"
        />
        <StatsCard
          label="Recent errors"
          value={report.recent_errors_count.toLocaleString()}
          icon={RefreshCwIcon}
          hint="Row-level errors in recent runs"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Runs by department</CardTitle>
            <CardDescription>
              Sync activity recorded per department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={report.by_department.map((department) => ({
                label: `${department.code} · ${department.name}`,
                value: department.runs,
                hint: department.errors_count
                  ? `${department.errors_count} errors`
                  : undefined,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden py-0">
          <CardHeader className="pt-6">
            <CardTitle>Department sync health</CardTitle>
            <CardDescription>
              Latest run status and accumulated row errors.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Runs</TableHead>
                  <TableHead>Last status</TableHead>
                  <TableHead>Last finished</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.by_department.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No department sync runs yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.by_department.map((department) => (
                    <TableRow key={department.code}>
                      <TableCell>
                        <p className="font-medium">{department.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {department.name}
                        </p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {department.runs}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={department.last_run_status ?? "not_run"}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTimeValue(
                          department.last_run_finished_at,
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {department.errors_count || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
