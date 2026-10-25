"use client";

import { SearchIcon } from "lucide-react";

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
import type { AcademicRecordRemarks } from "@/services/academic-record.service";

export type AcademicRecordSemester = "1st" | "2nd" | "summer";

interface AcademicRecordsFiltersProps {
  search: string;
  academicYear?: string;
  semester?: AcademicRecordSemester;
  remarks?: AcademicRecordRemarks;
  onSearchChange: (value: string) => void;
  onAcademicYearChange: (value: string) => void;
  onSemesterChange: (value?: AcademicRecordSemester) => void;
  onRemarksChange: (value?: AcademicRecordRemarks) => void;
  onReset: () => void;
}

export function AcademicRecordsFilters({
  search,
  academicYear,
  semester,
  remarks,
  onSearchChange,
  onAcademicYearChange,
  onSemesterChange,
  onRemarksChange,
  onReset,
}: AcademicRecordsFiltersProps) {
  return (
    <Card className="p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto] lg:items-center">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search subject code or name"
            className="pl-9"
            aria-label="Search academic records"
          />
        </div>

        <Input
          value={academicYear ?? ""}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          placeholder="Academic year"
          aria-label="Filter by academic year"
        />

        <Select
          value={semester ?? "all"}
          onValueChange={(value) =>
            onSemesterChange(
              value === "all"
                ? undefined
                : (value as AcademicRecordSemester),
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
          value={remarks ?? "all"}
          onValueChange={(value) =>
            onRemarksChange(
              value === "all" ? undefined : (value as AcademicRecordRemarks),
            )
          }
        >
          <SelectTrigger className="w-full" aria-label="Filter by remarks">
            <SelectValue placeholder="All remarks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All remarks</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="incomplete">Incomplete</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </Card>
  );
}
