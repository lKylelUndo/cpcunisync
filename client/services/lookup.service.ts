import axiosInstance from "@/lib/axios";
import type { ApiEnvelope, DepartmentSummary } from "@/services/types";

export interface DepartmentLookup extends DepartmentSummary {
  programs_count: number;
  students_count: number;
}

export interface ProgramLookup {
  id: number;
  code: string;
  name: string;
  department_id: number;
  students_count: number;
  department: DepartmentSummary | null;
}

export const lookupService = {
  getDepartments: async (): Promise<ApiEnvelope<DepartmentLookup[]>> =>
    (
      await axiosInstance.get<ApiEnvelope<DepartmentLookup[]>>(
        "/api/departments",
      )
    ).data,

  getPrograms: async (): Promise<ApiEnvelope<ProgramLookup[]>> =>
    (await axiosInstance.get<ApiEnvelope<ProgramLookup[]>>("/api/programs"))
      .data,
};
