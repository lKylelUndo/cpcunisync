import { cn } from "@/lib/utils";

export interface BarListItem {
  label: string;
  value: number;
  hint?: string;
}

interface BarListProps {
  items: BarListItem[];
  total?: number;
  emptyLabel?: string;
  className?: string;
  formatValue?: (value: number) => string;
}

export function BarList({
  items,
  total,
  emptyLabel = "No data recorded yet.",
  className,
  formatValue = (value) => value.toLocaleString(),
}: BarListProps) {
  if (items.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </p>
    );
  }

  const maxValue = Math.max(...items.map((item) => item.value), 0);
  const sum = total ?? items.reduce((accumulator, item) => accumulator + item.value, 0);
  const denominator = Math.max(maxValue, sum, 1);

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => {
        const width = Math.max(
          item.value === 0 ? 0 : 4,
          Math.round((item.value / denominator) * 100),
        );

        return (
          <li key={item.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium">{item.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatValue(item.value)}
                {item.hint ? (
                  <span className="ml-1.5 text-muted-foreground/70">
                    {item.hint}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80 transition-[width]"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
