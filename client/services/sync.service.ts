import { z } from "zod";

import axiosInstance from "@/lib/axios";
import type {
  ApiEnvelope,
  DepartmentSummary,
  PaginatedData,
} from "@/services/types";

export const syncMethodSchema = z.enum(["etl", "rest"]);
export const syncStatusSchema = z.enum([
  "running",
  "success",
  "partial",
  "failed",
]);
export const syncSourceSchema = z.enum(["education", "it", "hospitality"]);

export const syncRunSchema = z.object({
  department_code: syncSourceSchema.optional(),
  method: syncMethodSchema.optional(),
});

export type SyncRunInput = z.infer<typeof syncRunSchema>;

export const syncRunFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  per_page: z.coerce.number().int().min(1).max(50).optional(),
  department_code: z.string().optional(),
  status: syncStatusSchema.optional(),
  method: syncMethodSchema.optional(),
});

export type SyncRunFilters = z.infer<typeof syncRunFiltersSchema>;

export type SyncMethod = z.infer<typeof syncMethodSchema>;
export type SyncStatus = z.infer<typeof syncStatusSchema>;
export type SyncSource = z.infer<typeof syncSourceSchema>;

export interface SyncError {
  id: number;
  sync_run_id: number;
  row_identifier: string;
  message: string;
  payload: unknown;
  created_at: string | null;
  updated_at: string | null;
}

export interface SyncRun {
  id: number;
  department_id: number | null;
  department?: DepartmentSummary | null;
  method: SyncMethod;
  status: SyncStatus;
  extracted: number;
  loaded: number;
  updated: number;
  skipped: number;
  duplicates: number;
  failed: number;
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
  errors_count?: number;
  sync_errors?: SyncError[];
  created_at: string | null;
  updated_at: string | null;
}

export const syncService = {
  getAllRuns: async (
    filters: SyncRunFilters = {},
  ): Promise<ApiEnvelope<PaginatedData<SyncRun>>> =>
    (
      await axiosInstance.get<ApiEnvelope<PaginatedData<SyncRun>>>(
        "/api/sync/v1/all-runs",
        { params: filters },
      )
    ).data,

  getRun: async (id: number): Promise<ApiEnvelope<SyncRun>> =>
    (
      await axiosInstance.get<ApiEnvelope<SyncRun>>(
        `/api/sync/v1/view-run/${id}`,
      )
    ).data,

  runSync: async (data: SyncRunInput = {}): Promise<ApiEnvelope<SyncRun>> =>
    (
      await axiosInstance.post<ApiEnvelope<SyncRun>>(
        "/api/sync/v1/run",
        data,
      )
    ).data,
};
