"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BanIcon,
  CheckCircle2Icon,
  Loader2Icon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  SearchIcon,
  Trash2Icon,
  UserCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { roleLabel } from "@/components/features/admin/admin-navigation";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { TableSkeleton } from "@/components/features/shared/page-skeletons";
import { Pagination } from "@/components/features/shared/Pagination";
import { StatusBadge } from "@/components/features/shared/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/lib/api-errors";
import { formatDateTimeValue } from "@/lib/format";
import {
  adminRegistrationService,
  type AdminRegistration,
  type AdminRegistrationStatus,
  type RegnFilters,
} from "@/services/admin-registration.service";
import type { PaginatedData } from "@/services/types";

const STATUS_OPTIONS: {
  value: AdminRegistrationStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

const EMPTY_DESCRIPTIONS: Record<AdminRegistrationStatus, string> = {
  pending: "New staff registrations will appear here for review.",
  verified: "Verified accounts will appear here once registrations are approved.",
  rejected: "Rejected registrations will appear here for reference.",
  suspended: "Suspended accounts will appear here until they are reinstated.",
};

export function RegistrationsView() {
  const { isAdmin } = useAuth();
  const [registrations, setRegistrations] =
    useState<PaginatedData<AdminRegistration> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RegnFilters>({
    page: 1,
    per_page: 10,
    status: "pending",
  });
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<AdminRegistration | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [suspendTarget, setSuspendTarget] =
    useState<AdminRegistration | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim() || undefined;

      setFilters((current) =>
        current.q === nextSearch
          ? current
          : { ...current, q: nextSearch, page: 1 },
      );
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadRegistrations = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await adminRegistrationService.getAll(filters);

      if (response.status === "success" && response.data) {
        setRegistrations(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    void loadRegistrations();
  }, [loadRegistrations, isAdmin]);

  const verifyRegistration = async (registration: AdminRegistration) => {
    setBusyId(registration.id);

    try {
      const response = await adminRegistrationService.verifyUser(
        registration.id,
      );

      if (response.status === "success") {
        toast.success(
          response.message || `${registration.name} has been verified.`,
        );
        await loadRegistrations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const rejectRegistration = async () => {
    if (!rejectTarget) {
      return;
    }

    setIsRejecting(true);

    try {
      const response = await adminRegistrationService.rejectUser(
        rejectTarget.id,
        rejectNote.trim() || undefined,
      );

      if (response.status === "success") {
        toast.success(
          response.message ||
            `${rejectTarget.name}'s registration has been rejected.`,
        );
        setRejectTarget(null);
        setRejectNote("");
        await loadRegistrations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsRejecting(false);
    }
  };

  const reinstateRegistration = async (registration: AdminRegistration) => {
    setBusyId(registration.id);

    try {
      const response = await adminRegistrationService.reinstateUser(
        registration.id,
      );

      if (response.status === "success") {
        toast.success(
          response.message ||
            `${registration.name}'s account has been reinstated.`,
        );
        await loadRegistrations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const suspendRegistration = async () => {
    if (!suspendTarget) {
      return;
    }

    setIsSuspending(true);

    try {
      const response = await adminRegistrationService.suspendUser(
        suspendTarget.id,
      );

      if (response.status === "success") {
        toast.success(
          response.message ||
            `${suspendTarget.name}'s account has been suspended.`,
        );
        setSuspendTarget(null);
        await loadRegistrations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSuspending(false);
    }
  };

  const deleteRegistration = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await adminRegistrationService.deleteUser(
        deleteTarget.id,
      );

      if (response.status === "success") {
        toast.success(
          response.message || `${deleteTarget.name}'s account has been deleted.`,
        );
        setDeleteTarget(null);
        await loadRegistrations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const activeStatus =
    STATUS_OPTIONS.find((option) => option.value === filters.status)?.label ??
    "Pending";

  const emptyDescription = filters.status
    ? EMPTY_DESCRIPTIONS[filters.status]
    : "New staff registrations will appear here for review.";

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Account registrations"
          description="Review staff self-registrations before granting access to the central registry."
        />

        <EmptyState
          icon={UserCheckIcon}
          title="Administrators only"
          description="Only administrators can view and act on account registrations."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Account registrations"
        description="Review staff self-registrations before granting access to the central registry."
      />

      <Card className="py-4">
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-1"
            role="group"
            aria-label="Filter registrations by status"
          >
            {STATUS_OPTIONS.map((option) => {
              const active = filters.status === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "ghost"}
                  aria-pressed={active}
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      status: option.value,
                      page: 1,
                    }))
                  }
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="registration-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search registrations"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        {isLoading ? (
          <TableSkeleton />
        ) : registrations && registrations.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin ? (
                      <TableHead className="text-right">Actions</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.items.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <span className="block max-w-48 truncate font-medium">
                          {registration.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-56 truncate text-sm text-muted-foreground">
                          {registration.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {roleLabel(registration.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {registration.department
                          ? `${registration.department.code} · ${registration.department.name}`
                          : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDateTimeValue(registration.registered_at)}
                      </TableCell>
                      <TableCell className="max-w-64 whitespace-normal">
                        <StatusBadge status={registration.status} />
                        {registration.status === "verified" &&
                        registration.verified_at ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Verified{" "}
                            {formatDateTimeValue(registration.verified_at)}
                          </p>
                        ) : null}
                        {registration.status === "rejected" &&
                        registration.verification_note ? (
                          <p
                            className="mt-1 max-w-56 text-xs text-muted-foreground"
                            title={registration.verification_note}
                          >
                            Reason: {registration.verification_note}
                          </p>
                        ) : null}
                      </TableCell>
                      {isAdmin ? (
                        <TableCell>
                          <div className="flex items-center justify-end">
                            {registration.status === "rejected" ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={busyId !== null}
                                    aria-label={`Open actions for ${registration.name}`}
                                  >
                                    {busyId === registration.id ? (
                                      <Loader2Icon className="animate-spin" />
                                    ) : (
                                      <MoreHorizontalIcon />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {registration.status === "pending" ? (
                                    <>
                                      <DropdownMenuItem
                                        onSelect={() =>
                                          void verifyRegistration(registration)
                                        }
                                      >
                                        <CheckCircle2Icon className="text-emerald-600 dark:text-emerald-400" />
                                        Verify
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => {
                                          setRejectTarget(registration);
                                          setRejectNote("");
                                        }}
                                      >
                                        <XCircleIcon />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  ) : registration.status === "verified" ? (
                                    <>
                                      <DropdownMenuItem
                                        onSelect={() => {
                                          setSuspendTarget(registration);
                                        }}
                                      >
                                        <BanIcon className="text-amber-600 dark:text-amber-400" />
                                        Suspend
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => {
                                          setDeleteTarget(registration);
                                        }}
                                      >
                                        <Trash2Icon />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <>
                                      <DropdownMenuItem
                                        onSelect={() =>
                                          void reinstateRegistration(
                                            registration,
                                          )
                                        }
                                      >
                                        <RotateCcwIcon className="text-emerald-600 dark:text-emerald-400" />
                                        Reinstate
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => {
                                          setDeleteTarget(registration);
                                        }}
                                      >
                                        <Trash2Icon />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              page={registrations.page}
              totalPages={registrations.total_pages}
              total={registrations.total}
              perPage={registrations.per_page}
              onPageChange={(page) =>
                setFilters((current) => ({ ...current, page }))
              }
              disabled={isLoading}
            />
          </>
        ) : registrations ? (
          <EmptyState
            icon={UserCheckIcon}
            title={`No ${activeStatus.toLowerCase()} registrations`}
            description={
              filters.q
                ? "No accounts match the current search. Adjust the search or status filter."
                : emptyDescription
            }
          />
        ) : (
          <EmptyState
            icon={UserCheckIcon}
            title="Registrations could not be loaded"
            description="Check the API connection and try again."
            action={
              <Button
                variant="outline"
                onClick={() => void loadRegistrations()}
              >
                Retry
              </Button>
            }
          />
        )}
      </Card>

      <AlertDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isRejecting) {
            setRejectTarget(null);
            setRejectNote("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject registration?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejectTarget
                ? `${rejectTarget.name} (${rejectTarget.email}) will not be able to sign in unless an administrator verifies the account later.`
                : "This registration will not be granted access."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reject-note">Reason (optional)</Label>
            <Textarea
              id="reject-note"
              value={rejectNote}
              onChange={(event) => setRejectNote(event.target.value)}
              placeholder="Explain why this registration is being rejected."
              maxLength={500}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRejecting}
              onClick={(event) => {
                event.preventDefault();
                void rejectRegistration();
              }}
            >
              {isRejecting ? <Loader2Icon className="animate-spin" /> : null}
              Reject registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={suspendTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isSuspending) {
            setSuspendTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend account?</AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget
                ? `${suspendTarget.name} (${suspendTarget.email}) will not be able to sign in until the account is reinstated.`
                : "The account will be blocked from signing in."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSuspending}
              onClick={(event) => {
                event.preventDefault();
                void suspendRegistration();
              }}
            >
              {isSuspending ? <Loader2Icon className="animate-spin" /> : null}
              Suspend account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.name} (${deleteTarget.email}) will be permanently deleted and signed out everywhere. This cannot be undone.`
                : "This account will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteRegistration();
              }}
            >
              {isDeleting ? <Loader2Icon className="animate-spin" /> : null}
              Delete account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
