import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { AcademicRecord } from "@/services/academic-record.service";
import type { Enrollment } from "@/services/enrollment.service";
import type {
  ApiEnvelope,
  DepartmentSummary,
  IdPayload,
  PaginatedData,
  ProgramSummary,
} from "@/services/types";

export const studentSexSchema = z.enum(["male", "female", "other"]);

export const studentStatusSchema = z.enum([
  "active",
  "inactive",
  "graduated",
  "dropped",
]);

export const integrityStatusSchema = z.enum(["clean", "duplicate_suspect"]);

const optionalEmailSchema = z
  .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
  .optional()
  .nullable();

const optionalTextSchema = z.string().trim().optional().nullable();

export const studentSchema = z.object({
  student_number: z
    .string()
    .trim()
    .min(1, "Student number is required.")
    .max(30),
  first_name: z.string().trim().min(1, "First name is required.").max(255),
  middle_name: optionalTextSchema,
  last_name: z.string().trim().min(1, "Last name is required.").max(255),
  suffix: optionalTextSchema,
  email: optionalEmailSchema,
  phone: z.string().trim().max(30).optional().nullable(),
  sex: studentSexSchema,
  birth_date: z
    .string()
    .min(1, "Birth date is required.")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid birth date.",
    }),
  address: optionalTextSchema,
  program_id: z.coerce.number().int().positive("Select a program."),
  year_level: z.coerce.number().int().min(1).max(4).optional(),
  status: studentStatusSchema.optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;

export const studentUpdateSchema = studentSchema;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;

export const studentFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(50).optional(),
  q: z.string().optional(),
  department_id: z.coerce.number().int().positive().optional(),
  program_id: z.coerce.number().int().positive().optional(),
  status: studentStatusSchema.optional(),
  year_level: z.coerce.number().int().min(1).max(4).optional(),
  integrity_status: integrityStatusSchema.optional(),
});

export type StudentFilters = z.infer<typeof studentFiltersSchema>;

export const mergeStudentSchema = z.object({
  duplicate_id: z.coerce.number().int().positive("Select a duplicate record."),
});

export type MergeStudentInput = z.infer<typeof mergeStudentSchema>;

export type StudentSex = z.infer<typeof studentSexSchema>;
export type StudentStatus = z.infer<typeof studentStatusSchema>;
export type IntegrityStatus = z.infer<typeof integrityStatusSchema>;

export type DuplicateMatchReason = "student_number" | "email" | "name+birth_date";

export interface Student {
  id: number;
  student_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  sex: StudentSex;
  birth_date: string | null;
  address: string | null;
  year_level: number;
  status: StudentStatus;
  source: string;
  integrity_status: IntegrityStatus;
  duplicate_of_id: number | null;
  program_id: number | null;
  department_id: number | null;
  program?: ProgramSummary | null;
  department?: DepartmentSummary | null;
  duplicate_of?: Student | null;
  enrollments_count?: number;
  enrollments?: Enrollment[];
  academic_records?: AcademicRecord[];
  created_at: string | null;
  updated_at: string | null;
}

export interface DuplicateGroup {
  duplicate: Student;
  primary: Student;
  match_reason: DuplicateMatchReason;
}

export interface DuplicateGroupsData {
  groups: DuplicateGroup[];
}

export const studentService = {
  getAllStudents: async (
    filters: StudentFilters = {},
  ): Promise<ApiEnvelope<PaginatedData<Student>>> =>
    (
      await axiosInstance.get<ApiEnvelope<PaginatedData<Student>>>(
        "/api/students/v1/all-students",
        { params: filters },
      )
    ).data,

  getStudent: async (id: number): Promise<ApiEnvelope<Student>> =>
    (
      await axiosInstance.get<ApiEnvelope<Student>>(
        `/api/students/v1/view-student/${id}`,
      )
    ).data,

  createStudent: async (data: StudentInput): Promise<ApiEnvelope<Student>> =>
    (
      await axiosInstance.post<ApiEnvelope<Student>>(
        "/api/students/v1/create-student",
        data,
      )
    ).data,

  updateStudent: async (
    id: number,
    data: StudentUpdateInput,
  ): Promise<ApiEnvelope<Student>> =>
    (
      await axiosInstance.post<ApiEnvelope<Student>>(
        `/api/students/v1/update-student/${id}`,
        data,
      )
    ).data,

  deleteStudent: async (id: number): Promise<ApiEnvelope<IdPayload>> =>
    (
      await axiosInstance.post<ApiEnvelope<IdPayload>>(
        `/api/students/v1/delete-student/${id}`,
      )
    ).data,

  getDuplicates: async (): Promise<ApiEnvelope<DuplicateGroupsData>> =>
    (
      await axiosInstance.get<ApiEnvelope<DuplicateGroupsData>>(
        "/api/students/v1/duplicates",
      )
    ).data,

  mergeStudent: async (
    primaryId: number,
    data: MergeStudentInput,
  ): Promise<ApiEnvelope<Student>> =>
    (
      await axiosInstance.post<ApiEnvelope<Student>>(
        `/api/students/v1/merge-student/${primaryId}`,
        data,
      )
    ).data,

  dismissDuplicate: async (id: number): Promise<ApiEnvelope<Student>> =>
    (
      await axiosInstance.post<ApiEnvelope<Student>>(
        `/api/students/v1/dismiss-duplicate/${id}`,
      )
    ).data,
};
