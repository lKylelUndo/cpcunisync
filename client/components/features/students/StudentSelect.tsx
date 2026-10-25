"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentService, type Student } from "@/services/student.service";

interface StudentSelectProps {
  value?: number | null;
  onChange: (value?: number) => void;
  initialStudent?: Student | null;
  disabled?: boolean;
}

export function StudentSelect({
  value,
  onChange,
  initialStudent,
  disabled = false,
}: StudentSelectProps) {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const load = async () => {
        setIsLoading(true);
        setLoadError(false);

        try {
          const response = await studentService.getAllStudents({
            q: query.trim() || undefined,
            per_page: 50,
          });

          if (!active) {
            return;
          }

          if (response.status === "success" && response.data) {
            setStudents(response.data.items);
          } else {
            setLoadError(true);
          }
        } catch {
          if (active) {
            setLoadError(true);
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

      void load();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const options = useMemo(() => {
    const base =
      initialStudent && !students.some((item) => item.id === initialStudent.id)
        ? [initialStudent, ...students]
        : students;
    const term = query.trim().toLowerCase();

    if (!term) {
      return base;
    }

    return base.filter((student) =>
      `${student.student_number} ${student.full_name}`
        .toLowerCase()
        .includes(term),
    );
  }, [initialStudent, query, students]);

  const selectedLabel = useMemo(() => {
    const selected =
      students.find((student) => student.id === value) ??
      (initialStudent?.id === value ? initialStudent : undefined);

    return selected
      ? `${selected.student_number} · ${selected.full_name}`
      : undefined;
  }, [initialStudent, students, value]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name or student number"
          className="pl-9"
          disabled={disabled}
        />
      </div>
      <Select
        value={value ? String(value) : undefined}
        onValueChange={(next) => {
          onChange(Number(next));
          setQuery("");
        }}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={selectedLabel ?? "Select a student"}>
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {isLoading ? "Searching students…" : "No matching students."}
            </div>
          ) : (
            options.map((student) => (
              <SelectItem key={student.id} value={String(student.id)}>
                {student.student_number} · {student.full_name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {loadError ? (
        <p className="text-xs text-destructive">
          Students could not be loaded. Adjust the search to retry.
        </p>
      ) : null}
    </div>
  );
}
