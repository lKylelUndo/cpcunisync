import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { Student } from "@/services/student.service";
import type { ApiEnvelope } from "@/services/types";

export const integrationSourceSchema = z.enum([
  "created",
  "updated",
  "duplicate",
]);

export type IntegrationSource = z.infer<typeof integrationSourceSchema>;

export const integrationStudentSchema = z
  .object({
    student_number: z
      .string()
      .trim()
      .min(1, "Student number is required.")
      .max(30),
    first_name: z.string().trim().min(1, "First name is required.").max(255),
    middle_name: z.string().trim().max(255).optional().nullable(),
    last_name: z.string().trim().min(1, "Last name is required.").max(255),
    suffix: z.string().trim().max(255).optional().nullable(),
    email: z
      .union([
        z.string().trim().email("Enter a valid email address."),
        z.literal(""),
      ])
      .optional()
      .nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    sex: z.enum(["male", "female", "other"]),
    birth_date: z
      .string()
      .min(1, "Birth date is required.")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Enter a valid birth date.",
      }),
    address: z.string().trim().optional().nullable(),
    program_id: z.coerce.number().int().positive().optional(),
    program_code: z.string().trim().max(10).optional(),
    department_id: z.coerce.number().int().positive().optional(),
    year_level: z.coerce.number().int().min(1).max(4).optional(),
    status: z
      .enum(["active", "inactive", "graduated", "dropped"])
      .optional(),
    source: z.string().max(20).optional(),
  })
  .refine(
    (data) =>
      data.program_id !== undefined ||
      (data.program_code !== undefined && data.program_code.length > 0),
    {
      message: "Provide a program id or a program code.",
      path: ["program_id"],
    },
  );

export type IntegrationStudentInput = z.infer<
  typeof integrationStudentSchema
>;

export interface IntegrationCandidate {
  student: Student;
  match_reason: string;
}

export interface IntegrationStudentData {
  student: Student;
  candidates?: IntegrationCandidate[];
}

export const integrationService = {
  sendStudent: async (
    data: IntegrationStudentInput,
  ): Promise<ApiEnvelope<IntegrationStudentData>> =>
    (
      await axiosInstance.post<ApiEnvelope<IntegrationStudentData>>(
        "/api/integration/v1/students",
        data,
      )
    ).data,
};
