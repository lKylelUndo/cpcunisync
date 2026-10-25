import axiosInstance from "@/lib/axios";
import type {
  ApiEnvelope,
  DepartmentSummary,
  PaginatedData,
} from "@/services/types";

export type AdminRegistrationStatus = "pending" | "verified" | "rejected";
export type AdminRegistrationRole =
  | "admin"
  | "registrar"
  | "department_head";

export interface AdminRegistration {
  id: number;
  name: string;
  email: string;
  role: AdminRegistrationRole;
  department: DepartmentSummary | null;
  status: AdminRegistrationStatus;
  verification_note?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  registered_at: string;
}

export interface RegnFilters {
  status?: AdminRegistrationStatus;
  q?: string;
  page?: number;
  per_page?: number;
}

export interface AdminRegistrationActionData {
  user: {
    id: number;
    name: string;
    email: string;
    role: AdminRegistrationRole;
    department_id: number | null;
    status: AdminRegistrationStatus;
    verification_note: string | null;
    verified_by: number | null;
    verified_at: string | null;
  };
}

export const adminRegistrationService = {
  getAll: async (
    filters: RegnFilters = {},
  ): Promise<ApiEnvelope<PaginatedData<AdminRegistration>>> =>
    (
      await axiosInstance.get<ApiEnvelope<PaginatedData<AdminRegistration>>>(
        "/api/admin/v1/all-registrations",
        { params: filters },
      )
    ).data,

  verifyUser: async (
    id: number,
  ): Promise<ApiEnvelope<AdminRegistrationActionData>> =>
    (
      await axiosInstance.post<ApiEnvelope<AdminRegistrationActionData>>(
        `/api/admin/v1/verify-user/${id}`,
      )
    ).data,

  rejectUser: async (
    id: number,
    note?: string,
  ): Promise<ApiEnvelope<AdminRegistrationActionData>> =>
    (
      await axiosInstance.post<ApiEnvelope<AdminRegistrationActionData>>(
        `/api/admin/v1/reject-user/${id}`,
        { note: note?.trim() ? note.trim() : null },
      )
    ).data,
};
