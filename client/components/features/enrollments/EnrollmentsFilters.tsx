"use client";

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
import type {
  EnrollmentStatus,
  Semester,
} from "@/services/enrollment.service";

interface EnrollmentsFiltersProps {
  academicYear?: string;
  semester?: Semester;
  status?: EnrollmentStatus;
  onAcademicYearChange: (value: string) => void;
  onSemesterChange: (value?: Semester) => void;
  onStatusChange: (value?: EnrollmentStatus) => void;
  onReset: () => void;
}

export function EnrollmentsFilters({
  academicYear,
  semester,
  status,
  onAcademicYearChange,
  onSemesterChange,
  onStatusChange,
  onReset,
}: EnrollmentsFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-center">
        <Input
          value={academicYear ?? ""}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          placeholder="Academic year"
          aria-label="Filter by academic year"
          className="lg:w-full"
        />

        <Select
          value={semester ?? "all"}
          onValueChange={(value) =>
            onSemesterChange(
              value === "all" ? undefined : (value as Semester),
            )
          }
        >
          <SelectTrigger className="w-full" aria-label="Filter by semester">
            <SelectValue placeholder="All semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All semesters</SelectItem>
            <SelectItem value="1st">1st semester</SelectItem>
            <SelectItem value="2nd">2nd semester</SelectItem>
            <SelectItem value="summer">Summer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status ?? "all"}
          onValueChange={(value) =>
            onStatusChange(
              value === "all" ? undefined : (value as EnrollmentStatus),
            )
          }
        >
          <SelectTrigger className="w-full" aria-label="Filter by status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </Card>
  );
}
