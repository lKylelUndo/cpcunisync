"use client";

import Link from "next/link";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateValue, semesterLabel } from "@/lib/format";
import type { Enrollment } from "@/services/enrollment.service";

interface EnrollmentsTableProps {
  enrollments: Enrollment[];
  canWrite: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onDelete: (enrollment: Enrollment) => void;
}

export function EnrollmentsTable({
  enrollments,
  canWrite,
  onEdit,
  onDelete,
}: EnrollmentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-52">Student</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Academic year</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enrolled at</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <TableRow key={enrollment.id}>
              <TableCell>
                <Link
                  href={`/admin/students/${enrollment.student_id}`}
                  className="font-medium hover:underline"
                >
                  {enrollment.student?.full_name ??
                    `Student #${enrollment.student_id}`}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {enrollment.student?.student_number ??
                    `ID ${enrollment.student_id}`}
                </p>
              </TableCell>
              <TableCell>
                {enrollment.student?.program ? (
                  <>
                    <p className="text-sm">{enrollment.student.program.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.student.department?.code ?? "—"}
                    </p>
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{enrollment.academic_year}</TableCell>
              <TableCell>{semesterLabel(enrollment.semester)}</TableCell>
              <TableCell>
                <StatusBadge status={enrollment.status} />
              </TableCell>
              <TableCell>
                {formatDateValue(enrollment.enrolled_at)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link
                      href={`/admin/students/${enrollment.student_id}`}
                      aria-label="View student"
                    >
                      <EyeIcon />
                    </Link>
                  </Button>
                  {canWrite ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(enrollment)}
                        aria-label="Edit enrollment"
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(enrollment)}
                        aria-label="Delete enrollment"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2Icon />
                      </Button>
                    </>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
