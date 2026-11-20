"use client";

import Link from "next/link";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { workspacePath } from "@/lib/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { user } = useAuth();

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
                      href={workspacePath(
                        user,
                        `/students/${record.student_id}`,
                      )}
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
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open actions for ${
                          record.student?.full_name ??
                          `Student #${record.student_id}`
                        }`}
                      >
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={workspacePath(
                            user,
                            `/students/${record.student_id}`,
                          )}
                        >
                          <EyeIcon />
                          View details
                        </Link>
                      </DropdownMenuItem>
                      {canWrite ? (
                        <>
                          <DropdownMenuItem onSelect={() => onEdit(record)}>
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(record)}
                          >
                            <Trash2Icon />
                            Delete
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
