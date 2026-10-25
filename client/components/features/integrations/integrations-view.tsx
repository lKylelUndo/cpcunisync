"use client";

import { useCallback, useEffect, useState } from "react";
import { LayersIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { SyncHistoryTable } from "@/components/features/integrations/SyncHistoryTable";
import { SyncRunCard } from "@/components/features/integrations/SyncRunCard";
import { SyncRunDetailsDialog } from "@/components/features/integrations/SyncRunDetailsDialog";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { Pagination } from "@/components/features/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  lookupService,
  type DepartmentLookup,
} from "@/services/lookup.service";
import {
  syncService,
  type SyncMethod,
  type SyncRun,
  type SyncRunFilters,
  type SyncStatus,
} from "@/services/sync.service";
import type { PaginatedData } from "@/services/types";

export function IntegrationsView() {
  const { canWrite } = useAuth();
  const [runs, setRuns] = useState<PaginatedData<SyncRun> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SyncRunFilters>({
    page: 1,
    per_page: 10,
  });

  const [departments, setDepartments] = useState<DepartmentLookup[]>([]);
  const [detailsRunId, setDetailsRunId] = useState<number | null>(null);

  const loadRuns = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await syncService.getAllRuns(filters);

      if (response.status === "success" && response.data) {
        setRuns(response.data);
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
    void loadRuns();
  }, [loadRuns]);

  useEffect(() => {
    let active = true;

    const loadLookups = async () => {
      try {
        const response = await lookupService.getDepartments();

        if (active && response.status === "success" && response.data) {
          setDepartments(response.data);
        }
      } catch {
        // Filters fall back to the unfiltered list when lookups fail.
      }
    };

    void loadLookups();

    return () => {
      active = false;
    };
  }, []);

  const refreshRuns = () => {
    setFilters((current) =>
      current.page === 1 ? { ...current } : { ...current, page: 1 },
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Integrations"
        description="Department sync runs and student ingestion activity across education, IT, and hospitality sources."
      />

      <SyncRunCard
        canWrite={canWrite}
        onRunComplete={refreshRuns}
        onViewRun={(run) => setDetailsRunId(run.id)}
      />

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Sync runs</h2>
            <p className="text-sm text-muted-foreground">
              Every ETL and REST sync is recorded as a run.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.department_code ?? "all"}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  department_code: value === "all" ? undefined : value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-44" aria-label="Filter by department">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.code}>
                    {department.code} · {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.method ?? "all"}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  method:
                    value === "all" ? undefined : (value as SyncMethod),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-32" aria-label="Filter by method">
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="etl">ETL</SelectItem>
                <SelectItem value="rest">REST</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status:
                    value === "all" ? undefined : (value as SyncStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-32" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => void loadRuns()}
              disabled={isLoading}
              aria-label="Refresh sync history"
            >
              <RefreshCwIcon className={isLoading ? "animate-spin" : undefined} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </div>
        ) : runs && runs.items.length > 0 ? (
          <>
            <SyncHistoryTable
              runs={runs.items}
              onView={(run) => setDetailsRunId(run.id)}
            />
            <Pagination
              page={runs.page}
              totalPages={runs.total_pages}
              total={runs.total}
              perPage={runs.per_page}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page }))
              }
              disabled={isLoading}
            />
          </>
        ) : runs ? (
          <EmptyState
            icon={LayersIcon}
            title="No sync runs match the filters"
            description="Run a department sync or adjust the filters to see history."
          />
        ) : (
          <EmptyState
            icon={LayersIcon}
            title="Sync history could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button variant="outline" onClick={() => void loadRuns()}>
                Retry
              </Button>
            }
          />
        )}
      </Card>

      <SyncRunDetailsDialog
        runId={detailsRunId}
        open={detailsRunId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsRunId(null);
          }
        }}
      />
    </div>
  );
}
