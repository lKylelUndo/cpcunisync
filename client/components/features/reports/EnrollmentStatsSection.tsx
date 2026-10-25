"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarRangeIcon, GraduationCapIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";

import { StatsCard } from "@/components/features/admin/StatsCard";
import { BarList } from "@/components/features/shared/BarList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiErrorMessage } from "@/lib/api-errors";
import { semesterLabel } from "@/lib/format";
import {
  reportService,
  type EnrollmentStatsReport,
  type EnrollmentTermStats,
} from "@/services/report.service";

const SEMESTER_ORDER: Record<string, number> = {
  "1st": 1,
  "2nd": 2,
  summer: 3,
};

export function EnrollmentStatsSection() {
  const [report, setReport] = useState<EnrollmentStatsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setFailed(false);

    try {
      const response = await reportService.getEnrollmentStats();

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
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (failed || !report) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          Enrollment statistics could not be loaded.
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

  const terms = [...report.by_academic_year].sort((a, b) => {
    if (a.academic_year !== b.academic_year) {
      return a.academic_year < b.academic_year ? 1 : -1;
    }

    return (
      (SEMESTER_ORDER[b.semester] ?? 0) - (SEMESTER_ORDER[a.semester] ?? 0)
    );
  });

  const termTotal = terms.reduce((sum, term) => sum + term.total, 0);
  const genderTotal =
    report.by_gender.male + report.by_gender.female + report.by_gender.other;
  const latestTerm: EnrollmentTermStats | undefined = terms[0];
  const latestProgramCount = latestTerm?.by_program.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Term enrollments"
          value={termTotal.toLocaleString()}
          icon={CalendarRangeIcon}
          hint={`${terms.length} term${terms.length === 1 ? "" : "s"} recorded`}
        />
        <StatsCard
          label="Latest term"
          value={latestTerm ? latestTerm.total : "—"}
          icon={GraduationCapIcon}
          hint={
            latestTerm
              ? `${latestTerm.academic_year} · ${semesterLabel(latestTerm.semester)}`
              : "No enrollments yet"
          }
        />
        <StatsCard
          label="Students by gender"
          value={genderTotal.toLocaleString()}
          icon={UsersIcon}
          hint="Across all enrollment terms"
        />
        <StatsCard
          label="Programs in latest term"
          value={latestProgramCount}
          icon={GraduationCapIcon}
          hint={
            latestTerm ? semesterLabel(latestTerm.semester) : "No term data"
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Gender distribution</CardTitle>
            <CardDescription>
              Counts across students with an enrollment record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={[
                {
                  label: "Female",
                  value: report.by_gender.female,
                  hint: genderTotal
                    ? `${Math.round((report.by_gender.female / genderTotal) * 100)}%`
                    : undefined,
                },
                {
                  label: "Male",
                  value: report.by_gender.male,
                  hint: genderTotal
                    ? `${Math.round((report.by_gender.male / genderTotal) * 100)}%`
                    : undefined,
                },
                {
                  label: "Other",
                  value: report.by_gender.other,
                  hint: genderTotal
                    ? `${Math.round((report.by_gender.other / genderTotal) * 100)}%`
                    : undefined,
                },
              ]}
              total={genderTotal}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment volume by term</CardTitle>
            <CardDescription>
              New enrollment records per academic term.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={terms.map((term) => ({
                label: `${term.academic_year} · ${semesterLabel(term.semester)}`,
                value: term.total,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {terms.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No enrollment statistics are available yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {terms.map((term) => (
            <Card key={`${term.academic_year}-${term.semester}`}>
              <CardHeader>
                <CardTitle>
                  {term.academic_year} · {semesterLabel(term.semester)}
                </CardTitle>
                <CardDescription>
                  {term.total.toLocaleString()} enrollment
                  {term.total === 1 ? "" : "s"} in this term.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">By department</h3>
                  <BarList
                    items={term.by_department.map((department) => ({
                      label: `${department.code} · ${department.name}`,
                      value: department.count,
                    }))}
                    total={term.total}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">By program</h3>
                  <BarList
                    items={term.by_program.map((program) => ({
                      label: `${program.code} · ${program.name}`,
                      value: program.count,
                    }))}
                    total={term.total}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
