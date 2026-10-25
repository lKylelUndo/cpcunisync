import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  hint?: string;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("gap-4 py-5", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          {delta ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {delta}
            </p>
          ) : null}
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}
