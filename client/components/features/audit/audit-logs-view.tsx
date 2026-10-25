"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeIcon, HistoryIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AuditLogDetailsDialog } from "@/components/features/audit/AuditLogDetailsDialog";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Pagination } from "@/components/features/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDateTimeValue, humanize } from "@/lib/format";
import {
  auditService,
  type AuditLog,
  type AuditLogFilters,
} from "@/services/audit.service";
import type { PaginatedData } from "@/services/types";

const ACTIONS = [
  "created",
  "updated",
  "deleted",
  "merged_duplicate",
  "dismiss_duplicate",
  "login",
  "logout",
];

const MODEL_TYPES = ["Student", "Enrollment", "AcademicRecord", "User"];

function changedFields(log: AuditLog): string {
  const values = log.new_values ?? log.old_values ?? {};
  const keys = Object.keys(values);

  if (keys.length === 0) {
    return "—";
  }

  const preview = keys.slice(0, 3).map(humanize).join(", ");

  return keys.length > 3 ? `${preview} +${keys.length - 3} more` : preview;
}

export function AuditLogsView() {
  const [logs, setLogs] = useState<PaginatedData<AuditLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    per_page: 20,
  });
  const [userIdInput, setUserIdInput] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const parsed = Number(userIdInput.trim());
      const nextUserId =
        Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : undefined;

      setFilters((current) =>
        current.user_id === nextUserId
          ? current
          : { ...current, user_id: nextUserId, page: 1 },
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [userIdInput]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await auditService.getAllLogs(filters);

      if (response.status === "success" && response.data) {
        setLogs(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const resetFilters = () => {
    setUserIdInput("");
    setFilters({ page: 1, per_page: filters.per_page ?? 20 });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit logs"
        description="A chronological record of authentication and data changes across the central registry."
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,0.7fr)_auto] lg:items-center">
          <Select
            value={filters.action ?? "all"}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                action: value === "all" ? undefined : value,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full" aria-label="Filter by action">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {humanize(action)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.model_type ?? "all"}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                model_type: value === "all" ? undefined : value,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-full" aria-label="Filter by model">
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {MODEL_TYPES.map((modelType) => (
                <SelectItem key={modelType} value={modelType}>
                  {humanize(modelType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="1"
            value={userIdInput}
            onChange={(event) => setUserIdInput(event.target.value)}
            placeholder="User ID"
            aria-label="Filter by user ID"
          />

          <Button variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden py-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </div>
        ) : logs && logs.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">When</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Changed fields</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.items.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTimeValue(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {log.user?.name ?? "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.user?.email ?? `User #${log.user_id ?? "—"}`}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={log.action} />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{log.model_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.model_id ? `#${log.model_id}` : "No id"}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-64 text-xs text-muted-foreground">
                        {changedFields(log)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ip_address ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedLog(log)}
                            aria-label="View audit log details"
                          >
                            <EyeIcon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={logs.page}
              totalPages={logs.total_pages}
              total={logs.total}
              perPage={logs.per_page}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page }))
              }
              disabled={isLoading}
            />
          </>
        ) : logs ? (
          <EmptyState
            icon={HistoryIcon}
            title="No audit entries match the filters"
            description="Adjust the action, model, or user filter to see more activity."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title="Audit logs could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button variant="outline" onClick={() => void loadLogs()}>
                Retry
              </Button>
            }
          />
        )}
      </Card>

      <AuditLogDetailsDialog
        log={selectedLog}
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLog(null);
          }
        }}
      />
    </div>
  );
}
