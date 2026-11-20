"use client";

import { useState, type ChangeEvent } from "react";
import { FileUpIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  studentService,
  type ImportSummary,
} from "@/services/student.service";

interface ImportPreview {
  header: string[];
  body: string[][];
  totalRows: number;
}

const PREVIEW_ROW_LIMIT = 5;

/** Small hand-rolled CSV parser: handles quoted commas and a BOM. */
function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let index = 0;

  while (index < normalized.length) {
    const char = normalized[index];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[index + 1] === '"') {
          cell += '"';
          index += 2;
        } else {
          inQuotes = false;
          index += 1;
        }
      } else {
        cell += char;
        index += 1;
      }
      continue;
    }

    if (char === '"' && cell.length === 0) {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (char === ",") {
      row.push(cell);
      cell = "";
      index += 1;
      continue;
    }

    if (char === "\r" || char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (char === "\r" && normalized[index + 1] === "\n") {
        index += 1;
      }
      index += 1;
      continue;
    }

    cell += char;
    index += 1;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ImportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function ImportStudentsDialog({
  open,
  onOpenChange,
  onImported,
}: ImportStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setSummary(null);
    setImporting(false);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }

    onOpenChange(nextOpen);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;

    setFile(selected);
    setError(null);
    setPreview(null);

    if (!selected) {
      return;
    }

    try {
      const rows = parseCsv(await selected.text());
      const header = rows[0] ?? [];
      const body = rows.slice(1);

      setPreview({
        header,
        body: body.slice(0, PREVIEW_ROW_LIMIT),
        totalRows: body.length,
      });
    } catch {
      setFile(null);
      setError("Could not read the selected file as CSV.");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await studentService.downloadTemplate();
    } catch (caught) {
      toast.error(apiErrorMessage(caught));
    }
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const response = await studentService.importStudents(file);

      if (response.status === "success" && response.data) {
        setSummary(response.data);
      } else {
        const message =
          response.message ?? "Unable to import the CSV file.";

        toast.error(message);
        setError(message);
      }
    } catch (caught) {
      const message = apiErrorMessage(caught);
      toast.error(message);
      setError(message);
    } finally {
      setImporting(false);
    }
  };

  const handleDone = () => {
    handleOpenChange(false);
    onImported();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import students</DialogTitle>
          <DialogDescription>
            One row = one student. Duplicates (an existing student number,
            email, or name + birth date) are flagged for review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDownloadTemplate()}
          >
            Download CSV template
          </Button>

          <div className="space-y-2">
            <Label htmlFor="import-csv-file">CSV file</Label>
            <Input
              id="import-csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void handleFileChange(event)}
            />
            {file ? (
              <p className="text-xs text-muted-foreground">
                {file.name} · {formatBytes(file.size)}
              </p>
            ) : null}
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          {preview && preview.header.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Total rows: {preview.totalRows}
              </p>
              <div className="max-h-64 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {preview.header.map((cell, index) => (
                        <TableHead key={index}>{cell || "\u2014"}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.body.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {cell || "\u2014"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {preview.body.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No data rows found.
                </p>
              ) : null}
            </div>
          ) : null}

          {summary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(
                  [
                    "total",
                    "created",
                    "updated",
                    "skipped",
                    "duplicates",
                    "failed",
                  ] as const
                ).map((key) => (
                  <div
                    key={key}
                    className="rounded-md border px-2 py-2 text-center"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {key}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {summary[key]}
                    </p>
                  </div>
                ))}
              </div>
              {summary.errors.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Row errors</p>
                  <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-2">
                    {summary.errors.map((rowError, index) => (
                      <li key={index} className="text-xs">
                        Row {rowError.row}
                        {rowError.identifier ? ` (${rowError.identifier})` : ""}:{" "}
                        {rowError.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          {summary ? (
            <Button type="button" onClick={handleDone}>
              Done
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleImport()}
              disabled={importing || !file}
            >
              {importing ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <FileUpIcon />
              )}
              Import students
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
