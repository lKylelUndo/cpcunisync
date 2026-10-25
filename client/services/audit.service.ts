import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type { PaginatedData, ApiEnvelope } from "@/services/types";

export const auditLogFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(50).optional(),
  action: z.string().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  model_type: z.string().optional(),
});

export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>;

export interface AuditLogUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  user: AuditLogUser | null;
  action: string;
  model_type: string;
  model_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string | null;
}

export const auditService = {
  getAllLogs: async (
    filters: AuditLogFilters = {},
  ): Promise<ApiEnvelope<PaginatedData<AuditLog>>> =>
    (
      await axiosInstance.get<ApiEnvelope<PaginatedData<AuditLog>>>(
        "/api/audit-logs/v1/all-logs",
        { params: filters },
      )
    ).data,
};
