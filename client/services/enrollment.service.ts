import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { AcademicRecord } from "@/services/academic-record.service";
import type { Student } from "@/services/student.service";
import type { ApiEnvelope, IdPayload, PaginatedData } from "@/services/types";

export const semesterSchema = z.enum(["1st", "2nd", "summer"]);

export const enrollmentStatusSchema = z.enum([
  "enrolled",
  "dropped",
  "completed",
  "pending",
]);

export const academicYearSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, "Use the YYYY-YYYY format.");

export const enrollmentSchema = z.object({
  student_id: z.coerce
    .number()
    .int()
    .positive("Select a student."),
  academic_year: academicYearSchema,
  semester: semesterSchema,
  status: enrollmentStatusSchema.optional(),
  enrolled_at: z.string().optional().nullable(),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export const enrollmentFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(50).optional(),
  student_id: z.coerce.number().int().positive().optional(),
  academic_year: z.string().optional(),
  semester: semesterSchema.optional(),
  status: enrollmentStatusSchema.optional(),
});

export type EnrollmentFilters = z.infer<typeof enrollmentFiltersSchema>;

export type Semester = z.infer<typeof semesterSchema>;
export type EnrollmentStatus = z.infer<typeof enrollmentStatusSchema>;

export interface Enrollment {
  id: number;
  student_id: number;
  academic_year: string;
  semester: Semester;
  status: EnrollmentStatus;
  enrolled_at: string | null;
  student?: Student | null;
  academic_records?: AcademicRecord[];
  created_at: string | null;
  updated_at: string | null;
}

export const enrollmentService = {
  getAllEnrollments: async (
    filters: EnrollmentFilters = {},
  ): Promise<ApiEnvelope<PaginatedData<Enrollment>>> =>
    (
      await axiosInstance.get<ApiEnvelope<PaginatedData<Enrollment>>>(
        "/api/enrollments/v1/all-enrollments",
        { params: filters },
      )
    ).data,

  getEnrollment: async (id: number): Promise<ApiEnvelope<Enrollment>> =>
    (
      await axiosInstance.get<ApiEnvelope<Enrollment>>(
        `/api/enrollments/v1/view-enrollment/${id}`,
      )
    ).data,

  createEnrollment: async (
    data: EnrollmentInput,
  ): Promise<ApiEnvelope<Enrollment>> =>
    (
      await axiosInstance.post<ApiEnvelope<Enrollment>>(
        "/api/enrollments/v1/create-enrollment",
        data,
      )
    ).data,

  updateEnrollment: async (
    id: number,
    data: EnrollmentInput,
  ): Promise<ApiEnvelope<Enrollment>> =>
    (
      await axiosInstance.post<ApiEnvelope<Enrollment>>(
        `/api/enrollments/v1/update-enrollment/${id}`,
        data,
      )
    ).data,

  deleteEnrollment: async (id: number): Promise<ApiEnvelope<IdPayload>> =>
    (
      await axiosInstance.post<ApiEnvelope<IdPayload>>(
        `/api/enrollments/v1/delete-enrollment/${id}`,
      )
    ).data,
};
