"use client";

import { useState } from "react";
import { Loader2Icon, PlayIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/features/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatDateTimeValue, humanize } from "@/lib/format";
import {
  syncService,
  type SyncMethod,
  type SyncRun,
  type SyncSource,
} from "@/services/sync.service";

interface SyncRunCardProps {
  canWrite: boolean;
  onRunComplete: () => void;
  onViewRun: (run: SyncRun) => void;
}

const SOURCES: { value: SyncSource; label: string }[] = [
  { value: "education", label: "Education source · COE" },
  { value: "it", label: "IT source · CIT" },
  { value: "hospitality", label: "Hospitality source · CHM" },
];

export function SyncRunCard({
  canWrite,
  onRunComplete,
  onViewRun,
}: SyncRunCardProps) {
  const [source, setSource] = useState<SyncSource>("education");
  const [method, setMethod] = useState<SyncMethod>("etl");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SyncRun | null>(null);

  const runSync = async () => {
    setIsRunning(true);

    try {
      const response = await syncService.runSync({
        department_code: source,
        method,
      });

      if (response.status === "success" && response.data) {
        setResult(response.data);
        onRunComplete();

        if (response.data.status === "failed") {
          toast.error(response.message);
        } else if (response.data.status === "partial") {
          toast.warning(response.message);
        } else {
          toast.success(response.message);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run department sync</CardTitle>
        <CardDescription>
          Pull students from a simulated department source into the central
          registry. Simulated department sources: education, it, hospitality.
          Every run is recorded below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canWrite ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="sync-source">Source department</Label>
                <Select
                  value={source}
                  onValueChange={(value) =>
                    setSource(value as SyncSource)
                  }
                  disabled={isRunning}
                >
                  <SelectTrigger id="sync-source" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sync-method">Method</Label>
                <Select
                  value={method}
                  onValueChange={(value) =>
                    setMethod(value as SyncMethod)
                  }
                  disabled={isRunning}
                >
                  <SelectTrigger id="sync-method" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etl">ETL extraction</SelectItem>
                    <SelectItem value="rest">REST pull</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={() => void runSync()} disabled={isRunning}>
              {isRunning ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <PlayIcon />
              )}
              {isRunning
                ? "Running sync…"
                : method === "etl"
                  ? "Run ETL Sync"
                  : "Run REST Sync"}
            </Button>
          </>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Read-only access. Department heads can review sync history but
            cannot trigger runs.
          </p>
        )}

        {result ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={result.status} />
              <Badge variant="outline">{humanize(result.method)}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateTimeValue(result.started_at)}
              </span>
            </div>
            <p className="text-sm">{result.message ?? "Sync completed."}</p>
            <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
              {[
                ["Extracted", result.extracted],
                ["Loaded", result.loaded],
                ["Updated", result.updated],
                ["Skipped", result.skipped],
                ["Duplicates", result.duplicates],
                ["Failed", result.failed],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRun(result)}
            >
              <RefreshCwIcon />
              View run details
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
