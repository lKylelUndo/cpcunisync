import axiosInstance from "@/lib/axios";
import type { ApiEnvelope } from "@/services/types";

export interface DashboardBreakdown {
  code: string;
  name: string;
  count: number;
}

export interface DashboardLastSync {
  id: number;
  department_code: string | null;
  department_name: string | null;
  method: string;
  status: string;
  finished_at: string | null;
  loaded: number;
}

export interface DashboardData {
  students_total: number;
  students_by_status: {
    active: number;
    inactive: number;
    graduated: number;
    dropped: number;
  };
  active_enrollments: number;
  gender: {
    male: number;
    female: number;
    other: number;
  };
  duplicates_count: number;
  department_breakdown: DashboardBreakdown[];
  program_breakdown: DashboardBreakdown[];
  last_sync: DashboardLastSync | null;
  sync_health: {
    running: number;
    success: number;
    partial: number;
    failed: number;
  };
}

export const dashboardService = {
  getDashboard: async (): Promise<ApiEnvelope<DashboardData>> =>
    (await axiosInstance.get<ApiEnvelope<DashboardData>>("/api/dashboard"))
      .data,
};
