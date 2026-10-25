"use client";

import { RotateCcwIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DepartmentLookup, ProgramLookup } from "@/services/lookup.service";
import type {
  IntegrityStatus,
  StudentStatus,
} from "@/services/student.service";

const ALL = "all";

interface StudentsFiltersProps {
  search: string;
  departmentId?: number;
  programId?: number;
  status?: StudentStatus;
  yearLevel?: number;
  integrityStatus?: IntegrityStatus;
  departments: DepartmentLookup[];
  programs: ProgramLookup[];
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value?: number) => void;
  onProgramChange: (value?: number) => void;
  onStatusChange: (value?: StudentStatus) => void;
  onYearLevelChange: (value?: number) => void;
  onIntegrityStatusChange: (value?: IntegrityStatus) => void;
  onReset: () => void;
}

export function StudentsFilters({
  search,
  departmentId,
  programId,
  status,
  yearLevel,
  integrityStatus,
  departments,
  programs,
  onSearchChange,
  onDepartmentChange,
  onProgramChange,
  onStatusChange,
  onYearLevelChange,
  onIntegrityStatusChange,
  onReset,
}: StudentsFiltersProps) {
  return (
    <Card className="py-4">
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="student-search" className="text-xs text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="student-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Name, student number, or email"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Department</Label>
          <Select
            value={departmentId ? String(departmentId) : ALL}
            onValueChange={(value) =>
              onDepartmentChange(value === ALL ? undefined : Number(value))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={String(department.id)}>
                  {department.code} · {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Program</Label>
          <Select
            value={programId ? String(programId) : ALL}
            onValueChange={(value) =>
              onProgramChange(value === ALL ? undefined : Number(value))
            }
            disabled={programs.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={String(program.id)}>
                  {program.code} · {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={status ?? ALL}
            onValueChange={(value) =>
              onStatusChange(
                value === ALL ? undefined : (value as StudentStatus),
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="graduated">Graduated</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Year level</Label>
          <Select
            value={yearLevel ? String(yearLevel) : ALL}
            onValueChange={(value) =>
              onYearLevelChange(value === ALL ? undefined : Number(value))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All year levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All year levels</SelectItem>
              {[1, 2, 3, 4].map((level) => (
                <SelectItem key={level} value={String(level)}>
                  Year {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Integrity</Label>
          <Select
            value={integrityStatus ?? ALL}
            onValueChange={(value) =>
              onIntegrityStatusChange(
                value === ALL ? undefined : (value as IntegrityStatus),
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All records" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All records</SelectItem>
              <SelectItem value="clean">Clean</SelectItem>
              <SelectItem value="duplicate_suspect">Duplicate suspect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="w-full"
          >
            <RotateCcwIcon />
            Reset filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
