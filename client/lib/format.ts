import { format } from "date-fns";

function toDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateValue(value: string | null | undefined): string {
  const date = toDate(value);

  return date ? format(date, "MMM d, yyyy") : "—";
}

export function formatDateTimeValue(
  value: string | null | undefined,
): string {
  const date = toDate(value);

  return date ? format(date, "MMM d, yyyy HH:mm") : "—";
}

export function formatGrade(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : value.toFixed(2);
}

export function semesterLabel(semester: string | null | undefined): string {
  switch (semester) {
    case "1st":
      return "1st semester";
    case "2nd":
      return "2nd semester";
    case "summer":
      return "Summer";
    default:
      return semester ?? "—";
  }
}

export function durationBetween(
  startedAt: string | null | undefined,
  finishedAt: string | null | undefined,
): string {
  const start = toDate(startedAt);
  const finish = toDate(finishedAt);

  if (!start || !finish) {
    return "—";
  }

  const milliseconds = finish.getTime() - start.getTime();

  if (milliseconds < 0) {
    return "—";
  }

  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  const seconds = Math.round(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  return `${minutes}m ${seconds % 60}s`;
}

export function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/** Philippine academic year label, starting around June. */
export function defaultAcademicYear(): string {
  const now = new Date();
  const startYear =
    now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;

  return `${startYear}-${startYear + 1}`;
}
