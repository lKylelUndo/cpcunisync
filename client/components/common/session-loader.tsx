import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SessionLoader({
  label = "Verifying session...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
