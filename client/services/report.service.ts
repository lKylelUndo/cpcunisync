import axiosInstance from "@/lib/axios";
import type { ApiEnvelope } from "@/services/types";

export interface EnrollmentTermBreakdown {
  code: string;
  name: string;
  count: number;
}

export interface EnrollmentTermStats {
  academic_year: string;
  semester: string;
  total: number;
  by_program: EnrollmentTermBreakdown[];
  by_department: EnrollmentTermBreakdown[];
}

export interface EnrollmentStatsReport {
  by_academic_year: EnrollmentTermStats[];
  by_gender: {
    male: number;
    female: number;
    other: number;
  };
}

export interface AcademicSummaryOverall {
  recorded: number;
  passed: number;
  failed: number;
  incomplete: number;
  ongoing: number;
  pass_rate: number;
}

export interface AcademicSummaryProgram {
  code: string;
  name: string;
  average_grade: number | null;
  passed: number;
  failed: number;
  total: number;
}

export interface AcademicSummaryYearLevel {
  year_level: number;
  average_grade: number | null;
  total: number;
}

export interface AcademicSummaryReport {
  overall: AcademicSummaryOverall;
  by_program: AcademicSummaryProgram[];
  by_year_level: AcademicSummaryYearLevel[];
}

export interface SyncStatusDepartment {
  code: string;
  name: string;
  runs: number;
  last_run_status: string | null;
  last_run_finished_at: string | null;
  errors_count: number;
}

export interface SyncStatusReport {
  totals: {
    runs: number;
    success: number;
    partial: number;
    failed: number;
  };
  by_department: SyncStatusDepartment[];
  recent_errors_count: number;
}

export const reportService = {
  getEnrollmentStats: async (): Promise<
    ApiEnvelope<EnrollmentStatsReport>
  > =>
    (
      await axiosInstance.get<ApiEnvelope<EnrollmentStatsReport>>(
        "/api/reports/v1/enrollment-stats",
      )
    ).data,

  getAcademicSummary: async (): Promise<
    ApiEnvelope<AcademicSummaryReport>
  > =>
    (
      await axiosInstance.get<ApiEnvelope<AcademicSummaryReport>>(
        "/api/reports/v1/academic-summary",
      )
    ).data,

  getSyncStatus: async (): Promise<ApiEnvelope<SyncStatusReport>> =>
    (
      await axiosInstance.get<ApiEnvelope<SyncStatusReport>>(
        "/api/reports/v1/sync-status",
      )
    ).data,
};
