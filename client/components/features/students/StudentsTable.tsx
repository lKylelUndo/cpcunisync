"use client";

import Link from "next/link";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import { EmptyState } from "@/components/features/shared/EmptyState";
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
import type { Student } from "@/services/student.service";

interface StudentsTableProps {
  students: Student[];
  canWrite: boolean;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export function StudentsTable({
  students,
  canWrite,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  const { user } = useAuth();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student number</TableHead>
          <TableHead>Full name</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Integrity</TableHead>
          <TableHead className="text-right">Enrollments</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="p-0">
              <EmptyState
                icon={UsersIcon}
                title="No students found"
                description="Adjust the filters or create a student record to get started."
              />
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-mono text-xs">
                {student.student_number}
              </TableCell>
              <TableCell>
                <div className="max-w-56 truncate font-medium">
                  {student.full_name}
                </div>
                <div className="max-w-56 truncate text-xs text-muted-foreground">
                  {student.email ?? "No email on record"}
                </div>
              </TableCell>
              <TableCell>{student.program?.code ?? "—"}</TableCell>
              <TableCell>{student.department?.code ?? "—"}</TableCell>
              <TableCell>{student.year_level}</TableCell>
              <TableCell>
                <StatusBadge status={student.status} />
              </TableCell>
              <TableCell>
                <StatusBadge status={student.integrity_status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {student.enrollments_count ?? 0}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open actions for ${student.full_name}`}
                      >
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={workspacePath(user, `/students/${student.id}`)}
                        >
                          <EyeIcon />
                          View
                        </Link>
                      </DropdownMenuItem>
                      {canWrite ? (
                        <>
                          <DropdownMenuItem onSelect={() => onEdit(student)}>
                            <PencilIcon />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => onDelete(student)}
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
          ))
        )}
      </TableBody>
    </Table>
  );
}
