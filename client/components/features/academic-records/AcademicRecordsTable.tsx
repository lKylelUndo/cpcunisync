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
import { formatGrade, semesterLabel } from "@/lib/format";
import type { AcademicRecord } from "@/services/academic-record.service";

interface AcademicRecordsTableProps {
  records: AcademicRecord[];
  canWrite: boolean;
  onEdit: (record: AcademicRecord) => void;
  onDelete: (record: AcademicRecord) => void;
}

export function AcademicRecordsTable({
  records,
  canWrite,
  onEdit,
  onDelete,
}: AcademicRecordsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-52">Student</TableHead>
            <TableHead className="min-w-48">Subject</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <Link
                  href={`/admin/students/${record.student_id}`}
                  className="font-medium hover:underline"
                >
                  {record.student?.full_name ?? `Student #${record.student_id}`}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {record.student?.student_number ??
                    `ID ${record.student_id}`}
                </p>
              </TableCell>
              <TableCell>
                <p className="font-medium">{record.subject_code}</p>
                <p className="text-xs text-muted-foreground">
                  {record.subject_name}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{record.academic_year}</p>
                <p className="text-xs text-muted-foreground">
                  {semesterLabel(record.semester)}
                </p>
              </TableCell>
              <TableCell className="tabular-nums">
                {formatGrade(record.grade)}
              </TableCell>
              <TableCell>
                {record.remarks ? (
                  <StatusBadge status={record.remarks} />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {record.enrollment_id ? (
                  <span className="text-xs text-muted-foreground">
                    #{record.enrollment_id}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Not linked
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link
                      href={`/admin/students/${record.student_id}`}
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
                        onClick={() => onEdit(record)}
                        aria-label="Edit academic record"
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(record)}
                        aria-label="Delete academic record"
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
