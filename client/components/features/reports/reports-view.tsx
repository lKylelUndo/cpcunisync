"use client";

import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { AcademicSummarySection } from "@/components/features/reports/AcademicSummarySection";
import { EnrollmentStatsSection } from "@/components/features/reports/EnrollmentStatsSection";
import { SyncStatusSection } from "@/components/features/reports/SyncStatusSection";
import { Button } from "@/components/ui/button";

export function ReportsView() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reports"
        description="Enrollment, academic, and sync trends built directly from live registry data."
        actions={
          <Button
            variant="outline"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            <RefreshCwIcon />
            Refresh reports
          </Button>
        }
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Enrollment statistics
          </h2>
          <p className="text-sm text-muted-foreground">
            Term volume, program distribution, and gender breakdown.
          </p>
        </div>
        <EnrollmentStatsSection key={`enrollment-${refreshKey}`} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Academic summary
          </h2>
          <p className="text-sm text-muted-foreground">
            Subject outcomes, pass rate, and average grades by program and year
            level.
          </p>
        </div>
        <AcademicSummarySection key={`academic-${refreshKey}`} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Sync status</h2>
          <p className="text-sm text-muted-foreground">
            Department sync health, success rate, and recent row errors.
          </p>
        </div>
        <SyncStatusSection key={`sync-${refreshKey}`} />
      </section>
    </div>
  );
}
