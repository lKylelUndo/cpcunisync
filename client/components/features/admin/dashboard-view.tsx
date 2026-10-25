"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenIcon,
  ClipboardListIcon,
  CopyIcon,
  RefreshCwIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { StatsCard } from "@/components/features/admin/StatsCard";
import { BarList } from "@/components/features/shared/BarList";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { DashboardSkeleton } from "@/components/features/shared/page-skeletons";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatDateTimeValue, humanize } from "@/lib/format";
import {
  dashboardService,
  type DashboardData,
} from "@/services/dashboard.service";

const QUICK_LINKS = [
  {
    href: "/admin/students",
    label: "Student registry",
    description: "Search, edit, and inspect student records.",
    icon: UsersIcon,
  },
  {
    href: "/admin/enrollments",
    label: "Enrollments",
    description: "Manage term enrollment records.",
    icon: ClipboardListIcon,
  },
  {
    href: "/admin/integrations",
    label: "Integrations",
    description: "Run department syncs and review ingestion activity.",
    icon: RefreshCwIcon,
  },
  {
    href: "/admin/duplicates",
    label: "Duplicate queue",
    description: "Resolve suspected duplicate students.",
    icon: CopyIcon,
  },
  {
    href: "/admin/academic-records",
    label: "Academic records",
    description: "Review subject grades and remarks.",
    icon: BookOpenIcon,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    description: "Enrollment, academic, and sync summaries.",
    icon: BarChart3Icon,
  },
];

export function DashboardView() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await dashboardService.getDashboard();

      if (response.status === "success" && response.data) {
        setDashboard(response.data);
      } else {
        setHasError(true);
        toast.error(response.message);
      }
    } catch (error) {
      setHasError(true);
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeShare =
    dashboard && dashboard.students_total > 0
      ? Math.round(
          (dashboard.students_by_status.active / dashboard.students_total) *
            100,
        )
      : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Consolidated student, enrollment, and synchronisation health across the three CPC departments."
      />

      {isLoading ? <DashboardSkeleton /> : null}

      {!isLoading && hasError ? (
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={BarChart3Icon}
              title="Unable to load the dashboard"
              description="The API did not return dashboard totals. Try the request again."
              action={
                <Button variant="outline" onClick={() => void loadDashboard()}>
                  <RefreshCwIcon />
                  Retry
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !hasError && dashboard ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatsCard
              label="Total students"
              value={dashboard.students_total.toLocaleString()}
              icon={UsersIcon}
              hint={`${dashboard.students_by_status.active.toLocaleString()} active records`}
            />
            <StatsCard
              label="Active enrollments"
              value={dashboard.active_enrollments.toLocaleString()}
              icon={ClipboardListIcon}
              hint="Enrollments marked enrolled"
            />
            <StatsCard
              label="Active share"
              value={`${activeShare}%`}
              icon={UserCheckIcon}
              delta={`${dashboard.students_by_status.active.toLocaleString()} of ${dashboard.students_total.toLocaleString()} students`}
            />
            <StatsCard
              label="Duplicate suspects"
              value={dashboard.duplicates_count.toLocaleString()}
              icon={CopyIcon}
              hint="Flagged for integrity review"
            />
            <StatsCard
              label="Programs"
              value={dashboard.program_breakdown.length}
              icon={BookOpenIcon}
              hint={`Across ${dashboard.department_breakdown.length} departments`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Students by department</CardTitle>
                <CardDescription>
                  Headcount per college from the central registry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarList
                  items={dashboard.department_breakdown.map((item) => ({
                    label: `${item.code} · ${item.name}`,
                    value: item.count,
                  }))}
                  emptyLabel="No departmental students recorded yet."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Students by status</CardTitle>
                <CardDescription>
                  Current academic standing across all student records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dashboard.students_by_status).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2"
                      >
                        <StatusBadge status={status} />
                        <span className="text-sm font-semibold tabular-nums">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ),
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Active proportion
                    </span>
                    <span className="font-medium tabular-nums">
                      {activeShare}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${activeShare}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gender breakdown</CardTitle>
                <CardDescription>
                  Distribution recorded in student profiles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarList
                  items={Object.entries(dashboard.gender).map(
                    ([label, value]) => ({
                      label: humanize(label),
                      value,
                    }),
                  )}
                  emptyLabel="No gender data recorded yet."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Last sync</CardTitle>
                <CardDescription>
                  Most recent synchronisation run recorded by the API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard.last_sync ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {dashboard.last_sync.department_name ??
                          dashboard.last_sync.department_code ??
                          "All departments"}
                      </p>
                      <Badge variant="outline" className="uppercase">
                        {dashboard.last_sync.method}
                      </Badge>
                      <StatusBadge status={dashboard.last_sync.status} />
                    </div>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Finished
                        </dt>
                        <dd className="mt-0.5">
                          {formatDateTimeValue(
                            dashboard.last_sync.finished_at,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Records loaded
                        </dt>
                        <dd className="mt-0.5 tabular-nums">
                          {dashboard.last_sync.loaded.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/integrations">
                        View sync history
                        <ArrowRightIcon />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={RefreshCwIcon}
                    title="No sync performed yet"
                    description="Run an ETL or REST sync from the Integrations page to populate this panel."
                    action={
                      <Button asChild size="sm" variant="outline">
                        <Link href="/admin/integrations">
                          Open integrations
                          <ArrowRightIcon />
                        </Link>
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync health</CardTitle>
                <CardDescription>
                  Lifetime run outcomes across every synchronisation source.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(dashboard.sync_health).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5"
                      >
                        <StatusBadge status={status} />
                        <span className="text-sm font-semibold tabular-nums">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick links</CardTitle>
                <CardDescription>
                  Jump to the registrar workflows used most often.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-sm font-medium">
                          {link.label}
                          <ArrowRightIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
