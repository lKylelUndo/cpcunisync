import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { ApiEnvelope, DepartmentSummary } from "@/services/types";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  device_name: z.string().max(255).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type UserRole = "admin" | "registrar" | "department_head";
export type RegistrationRole = "registrar" | "department_head";

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Name must be at least 3 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    password_confirmation: z
      .string()
      .min(8, "Confirm your password."),
    role: z.enum(["registrar", "department_head"]),
    department_id: z.number().int().positive().optional().nullable(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  })
  .refine(
    (data) =>
      data.role !== "department_head" ||
      (typeof data.department_id === "number" && data.department_id > 0),
    {
      path: ["department_id"],
      message: "Select a department for the department head account.",
    },
  );

export type RegisterInput = z.infer<typeof registerSchema>;

export interface RegistrationOptions {
  roles: RegistrationRole[];
  departments: DepartmentSummary[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department_id: number | null;
  status?: "pending" | "verified" | "rejected";
}

export interface LoginData {
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  user: AuthUser;
}

export const authService = {
  login: async (
    data: LoginInput,
  ): Promise<ApiEnvelope<LoginData>> =>
    (
      await axiosInstance.post<ApiEnvelope<LoginData>>(
        "/api/auth/v1/login",
        data,
      )
    ).data,

  register: async (
    data: RegisterInput,
  ): Promise<ApiEnvelope<RegisterData>> =>
    (
      await axiosInstance.post<ApiEnvelope<RegisterData>>(
        "/api/auth/v1/register",
        data,
      )
    ).data,

  getRegistrationOptions: async (): Promise<
    ApiEnvelope<RegistrationOptions>
  > =>
    (
      await axiosInstance.get<ApiEnvelope<RegistrationOptions>>(
        "/api/registration/v1/options",
      )
    ).data,

  logout: async (): Promise<ApiEnvelope> =>
    (await axiosInstance.post<ApiEnvelope>("/api/auth/v1/logout")).data,

  getMe: async (): Promise<ApiEnvelope<AuthUser>> =>
    (await axiosInstance.get<ApiEnvelope<AuthUser>>("/api/auth/v1/me")).data,
};
