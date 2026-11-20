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
  const { user } = useAuth();

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
                      href={workspacePath(
                        user,
                        `/students/${enrollment.student_id}`,
                      )}
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
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open actions for ${
                          enrollment.student?.full_name ??
                          `Student #${enrollment.student_id}`
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
                            `/students/${enrollment.student_id}`,
                          )}
                        >
                          <EyeIcon />
                          View details
                        </Link>
                      </DropdownMenuItem>
                      {canWrite ? (
                        <>
                          <DropdownMenuItem
                            onSelect={() => onEdit(enrollment)}
                          >
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(enrollment)}
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
