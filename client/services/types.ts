/** Shared API envelope and cross-domain entity shapes. */

export type ApiStatus = "success" | "error";

/**
 * Flat envelope returned by every Laravel endpoint.
 * HTTP status is usually 200 — branch on `status` from the body.
 */
export interface ApiEnvelope<TData = unknown> {
  status: ApiStatus;
  message: string;
  data?: TData;
  source?: string;
  note?: string | null;
}

/** Body of a FormRequest 422 validation failure. */
export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/** Hand-rolled pagination contract used across listing endpoints. */
export interface PaginatedData<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface IdPayload {
  id: number;
}

export interface DepartmentSummary {
  id: number;
  code: string;
  name: string;
}

export interface ProgramSummary {
  id: number;
  code: string;
  name: string;
  department: DepartmentSummary | null;
}
