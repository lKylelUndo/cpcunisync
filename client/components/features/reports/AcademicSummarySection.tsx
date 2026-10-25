"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpenCheckIcon,
  GraduationCapIcon,
  PercentIcon,
  TrendingUpIcon,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatGrade } from "@/lib/format";
import {
  reportService,
  type AcademicSummaryReport,
} from "@/services/report.service";

export function AcademicSummarySection() {
  const [report, setReport] = useState<AcademicSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setFailed(false);

    try {
      const response = await reportService.getAcademicSummary();

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
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (failed || !report) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          The academic summary could not be loaded.
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

  const programAverages = report.by_program.filter(
    (program) => program.average_grade !== null,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Recorded subjects"
          value={report.overall.recorded.toLocaleString()}
          icon={BookOpenCheckIcon}
          hint="Academic records with a grade"
        />
        <StatsCard
          label="Passed"
          value={report.overall.passed.toLocaleString()}
          icon={GraduationCapIcon}
          hint={`${report.overall.failed.toLocaleString()} failed`}
        />
        <StatsCard
          label="Pass rate"
          value={`${report.overall.pass_rate.toFixed(1)}%`}
          icon={PercentIcon}
          hint="Passed ÷ recorded subjects"
        />
        <StatsCard
          label="Ongoing / incomplete"
          value={`${report.overall.ongoing} / ${report.overall.incomplete}`}
          icon={TrendingUpIcon}
          hint="Awaiting final grades"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grade outcomes</CardTitle>
            <CardDescription>
              Distribution of remarks across all academic records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={[
                { label: "Passed", value: report.overall.passed },
                { label: "Failed", value: report.overall.failed },
                { label: "Incomplete", value: report.overall.incomplete },
                { label: "Ongoing", value: report.overall.ongoing },
              ]}
              total={report.overall.recorded}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average grade by year level</CardTitle>
            <CardDescription>
              Graded subjects only, measured on a 0–100 scale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={report.by_year_level
                .filter((row) => row.average_grade !== null)
                .map((row) => ({
                  label: `Year ${row.year_level}`,
                  value: row.average_grade ?? 0,
                  hint: `${row.total} subject${row.total === 1 ? "" : "s"}`,
                }))}
              total={100}
              formatValue={(value) => value.toFixed(2)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average grade by program</CardTitle>
            <CardDescription>
              Programs with at least one graded subject.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              items={programAverages.map((program) => ({
                label: `${program.code} · ${program.name}`,
                value: program.average_grade ?? 0,
                hint: `n=${program.total}`,
              }))}
              total={100}
              formatValue={(value) => value.toFixed(2)}
              emptyLabel="No graded subjects by program yet."
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden py-0">
          <CardHeader className="pt-6">
            <CardTitle>Program performance</CardTitle>
            <CardDescription>
              Average grade and pass/fail counts per program.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="text-right">Passed</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.by_program.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No program-level academic data yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.by_program.map((program) => (
                    <TableRow key={program.code}>
                      <TableCell>
                        <p className="font-medium">{program.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {program.name}
                        </p>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatGrade(program.average_grade)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {program.passed}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {program.failed}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {program.total}
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
