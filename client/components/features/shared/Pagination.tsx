"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onPageChange,
  disabled = false,
  className,
}: PaginationProps) {
  const pages = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), pages);
  const from = total === 0 ? 0 : (current - 1) * (perPage ?? 0) + 1;
  const to =
    total === 0
      ? 0
      : perPage
        ? Math.min(current * perPage, total)
        : Math.min(total, current * Math.max(total, 1));

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        {total === 0
          ? "No records"
          : `${from}–${to} of ${total.toLocaleString()} records`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current - 1)}
          disabled={disabled || current <= 1}
        >
          <ChevronLeftIcon />
          Previous
        </Button>
        <span className="min-w-24 text-center text-xs text-muted-foreground">
          Page {current} of {pages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(current + 1)}
          disabled={disabled || current >= pages}
        >
          Next
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
