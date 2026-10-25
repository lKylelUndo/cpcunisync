import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { ApiEnvelope } from "@/services/types";

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

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department_id: number | null;
}

export interface LoginData {
  token: string;
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

  logout: async (): Promise<ApiEnvelope> =>
    (await axiosInstance.post<ApiEnvelope>("/api/auth/v1/logout")).data,

  getMe: async (): Promise<ApiEnvelope<AuthUser>> =>
    (await axiosInstance.get<ApiEnvelope<AuthUser>>("/api/auth/v1/me")).data,
};
