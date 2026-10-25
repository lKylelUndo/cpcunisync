import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import type { ApiValidationError } from "@/services/types";

export function apiErrorMessage(
  error: unknown,
  fallback = "Unable to reach the server. Please try again.",
): string {
  if (isAxiosError<ApiValidationError>(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}

/**
 * Maps a Laravel FormRequest 422 body onto react-hook-form fields.
 * Returns false when the error is not a 422 or no field could be mapped.
 */
export function applyValidationErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (
    !isAxiosError<ApiValidationError>(error) ||
    error.response?.status !== 422
  ) {
    return false;
  }

  const body = error.response.data;
  const errors = body?.errors ?? {};
  let mapped = false;

  for (const [field, messages] of Object.entries(errors)) {
    if (!(fields as readonly string[]).includes(field)) {
      continue;
    }

    setError(field as Path<T>, {
      type: "server",
      message: messages[0] ?? body.message ?? "Invalid value.",
    });
    mapped = true;
  }

  return mapped;
}
