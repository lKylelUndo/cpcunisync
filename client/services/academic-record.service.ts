import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { Enrollment } from "@/services/enrollment.service";
import type { Student } from "@/services/student.service";
import type { ApiEnvelope, IdPayload, PaginatedData } from "@/services/types";

export const academicRecordRemarksSchema = z.enum([
  "passed",
  "failed",
  "incomplete",
  "ongoing",
]);

export const academicRecordSchema = z.object({
  student_id: z.coerce
    .number()
    .int()
    .positive("Select a student."),
  enrollment_id: z.coerce.number().int().positive().optional().nullable(),
  subject_code: z
    .string()
    .trim()
    .min(1, "Subject code is required.")
    .max(20),
  subject_name: z
    .string()
    .trim()
    .min(1, "Subject name is required.")
    .max(255),
  semester: z.enum(["1st", "2nd", "summer"]),
  grade: z
    .number()
    .min(0, "Grade cannot be below 0.")
    .max(100, "Grade cannot exceed 100.")
    .optional()
    .nullable(),
  remarks: academicRecordRemarksSchema.optional().nullable(),
  academic_year: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Use the YYYY-YYYY format."),
});

export type AcademicRecordInput = z.infer<typeof academicRecordSchema>;

export const academicRecordFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(50).optional(),
  student_id: z.coerce.number().int().positive().optional(),
  academic_year: z.string().optional(),
  semester: z.enum(["1st", "2nd", "summer"]).optional(),
  remarks: academicRecordRemarksSchema.optional(),
  q: z.string().optional(),
});

export type AcademicRecordFilters = z.infer<typeof academicRecordFiltersSchema>;

export type AcademicRecordRemarks = z.infer<
  typeof academicRecordRemarksSchema
>;

export interface AcademicRecord {
  id: number;
  student_id: number;
  enrollment_id: number | null;
  subject_code: string;
  subject_name: string;
  semester: string;
  grade: number | null;
  remarks: AcademicRecordRemarks | null;
  academic_year: string;
  student?: Student | null;
  enrollment?: Enrollment | null;
  created_at: string | null;
  updated_at: string | null;
}

export const academicRecordService = {
  getAllRecords: async (
    filters: AcademicRecordFilters = {},
  ): Promise<ApiEnvelope<PaginatedData<AcademicRecord>>> =>
    (
      await axiosInstance.get<ApiEnvelope<PaginatedData<AcademicRecord>>>(
        "/api/academic-records/v1/all-records",
        { params: filters },
      )
    ).data,

  createRecord: async (
    data: AcademicRecordInput,
  ): Promise<ApiEnvelope<AcademicRecord>> =>
    (
      await axiosInstance.post<ApiEnvelope<AcademicRecord>>(
        "/api/academic-records/v1/create-record",
        data,
      )
    ).data,

  updateRecord: async (
    id: number,
    data: AcademicRecordInput,
  ): Promise<ApiEnvelope<AcademicRecord>> =>
    (
      await axiosInstance.post<ApiEnvelope<AcademicRecord>>(
        `/api/academic-records/v1/update-record/${id}`,
        data,
      )
    ).data,

  deleteRecord: async (id: number): Promise<ApiEnvelope<IdPayload>> =>
    (
      await axiosInstance.post<ApiEnvelope<IdPayload>>(
        `/api/academic-records/v1/delete-record/${id}`,
      )
    ).data,
};
