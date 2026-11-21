"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  AdminUsersRequestError,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
  type AdminUser,
  type UserRole,
  type UserRoleFilter,
  type UsersListData,
} from "@/lib/admin-users-api";
import { useSession } from "@/lib/auth-client";

const PAGE_SIZE = 10;

const filters: { key: UserRoleFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customer" },
  { key: "owner", label: "Owner" },
  { key: "admin", label: "Admin" },
];

const roleStyles: Record<UserRole, string> = {
  admin:
    "border-lime-300 bg-lime-100 text-green-800 dark:border-lime-700/60 dark:bg-green-900/40 dark:text-lime-200",
  owner:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-900/25 dark:text-sky-200",
  customer:
    "border-border bg-muted text-muted-foreground dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-200",
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2))
    .toUpperCase();
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const TableSkeleton = () => (
  <div className="divide-y divide-border">
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-4 px-5 py-4"
      >
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="hidden h-4 w-52 md:block" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="hidden h-4 w-24 lg:block" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
    ))}
  </div>
);

const AllUsersPage = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [data, setData] = useState<UsersListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<UserRoleFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [nextRole, setNextRole] = useState<UserRole>("customer");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [confirmedDelete, setConfirmedDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (isSessionPending || !isAdmin) return;

    const controller = new AbortController();

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchAdminUsers(
          {
            role: activeFilter,
            search,
            page,
            limit: PAGE_SIZE,
          },
          controller.signal,
        );
        if (!controller.signal.aborted) setData(response.data);
      } catch (caught) {
        if (controller.signal.aborted) return;

        setError(
          caught instanceof AdminUsersRequestError && caught.status === 401
            ? "Your session has expired. Please sign in again."
            : getErrorMessage(caught, "Could not load users."),
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isSessionPending, isAdmin, activeFilter, search, page, reloadKey]);

  const retry = () => setReloadKey((current) => current + 1);

  const openRoleDialog = (user: AdminUser) => {
    setNextRole(user.role);
    setRoleTarget(user);
  };

  const submitRoleChange = async () => {
    if (!roleTarget) return;

    setIsSubmitting(true);
    try {
      const result = await updateAdminUserRole(roleTarget.id, nextRole);
      toast.add({
        type: "success",
        title: "Role updated",
        description: result.message,
        timeout: 5000,
      });
      setRoleTarget(null);
      retry();
    } catch (caught) {
      toast.add({
        type: "error",
        title: "Could not update role",
        description: getErrorMessage(caught, "Please try again."),
        timeout: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (user: AdminUser) => {
    setConfirmedDelete(false);
    setDeleteTarget(user);
  };

  const submitDelete = async () => {
    if (!deleteTarget || !confirmedDelete) return;

    setIsSubmitting(true);
    try {
      const result = await deleteAdminUser(deleteTarget.id);
      toast.add({
        type: "success",
        title: "User deleted",
        description: result.message,
        timeout: 5000,
      });
      setDeleteTarget(null);
      setConfirmedDelete(false);
      retry();
    } catch (caught) {
      toast.add({
        type: "error",
        title: "Could not delete user",
        description: getErrorMessage(caught, "Please try again."),
        timeout: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-5 h-8 w-72" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-16 text-center dark:border-amber-900/60 dark:bg-amber-950/20">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-foreground">
          Admin access required
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Only administrators can manage registered users.
        </p>
        <Button
          render={<Link href="/dashboard/admin" />}
          nativeButton={false}
          className="mt-6 rounded-lg bg-[#166534] text-white hover:bg-[#14532D]"
        >
          <ArrowLeft aria-hidden="true" />
          Back to Admin Overview
        </Button>
      </div>
    );
  }

  const isInitializing = isAdmin && isLoading;
  const totalRegistered = data?.totalRegisteredUsers ?? data?.totalUsers ?? 0;
  const counts = data?.roleCounts ?? {
    all: 0,
    customer: 0,
    owner: 0,
    admin: 0,
  };
  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;
  const isEmpty = !isInitializing && !error && users.length === 0;
  const hasFilters = activeFilter !== "all" || search.length > 0;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-green-700 dark:hover:text-lime-300"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Admin Overview
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Registered Users ({totalRegistered})
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Assign platform roles, manage permissions, or delete accounts.
          </p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search users by name or email"
            className="h-11 rounded-xl border-border bg-card pr-9 pl-9 text-sm shadow-sm"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filter users by role"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveFilter(filter.key);
                setPage(1);
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
                isActive
                  ? "border-[#166534] bg-[#166534] text-white shadow-md shadow-green-900/15 dark:border-lime-400 dark:bg-lime-400 dark:text-[#17251C]"
                  : "border-border bg-card text-muted-foreground hover:border-green-500/60 hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-[#17251C]/15 dark:text-[#17251C]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {counts[filter.key]}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-bold text-red-800 dark:text-red-200">
            Could not load users
          </p>
          <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={retry}
            className="mt-5 rounded-lg"
          >
            <RefreshCw aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="border-b border-border bg-background/60">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                      User
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                      Email
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                      Current Role
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                      Joined Date
                    </th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                {isInitializing ? (
                  <tbody>
                    <tr>
                      <td colSpan={5} className="p-0">
                        <TableSkeleton />
                      </td>
                    </tr>
                  </tbody>
                ) : isEmpty ? (
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                          <Users className="size-7" aria-hidden="true" />
                        </span>
                        <p className="mt-5 text-base font-bold text-foreground">
                          {totalRegistered === 0
                            ? "No registered users yet"
                            : "No users found"}
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                          {totalRegistered === 0
                            ? "New accounts will appear here as soon as people join GearNest."
                            : hasFilters
                              ? "Try a different role filter or search term."
                              : "Try again in a moment."}
                        </p>
                        {hasFilters ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setActiveFilter("all");
                              setSearchInput("");
                              setSearch("");
                              setPage(1);
                            }}
                            className="mt-5 rounded-lg"
                          >
                            Clear filters
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-green-50/40 dark:hover:bg-green-900/10"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar size="lg" className="size-10">
                              <AvatarImage src={user.image ?? undefined} alt="" />
                              <AvatarFallback className="bg-lime-100 font-bold text-green-800 dark:bg-green-900/40 dark:text-lime-200">
                                {initials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {user.name || "Unnamed user"}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {user.emailVerified ? "Verified account" : "Unverified"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail
                              className="size-3.5 shrink-0 text-green-700 dark:text-lime-400"
                              aria-hidden="true"
                            />
                            <span className="truncate">{user.email}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${roleStyles[user.role]}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays
                              className="size-3.5 shrink-0 text-green-700 dark:text-lime-400"
                              aria-hidden="true"
                            />
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openRoleDialog(user)}
                              className="rounded-lg text-xs font-semibold"
                            >
                              <UserCog aria-hidden="true" />
                              Change Role
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              className="rounded-lg text-xs font-semibold"
                            >
                              <Trash2 aria-hidden="true" />
                              Delete User
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          </div>

          {!isInitializing && !isEmpty ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {((data?.currentPage ?? 1) - 1) * PAGE_SIZE + 1}–
                  {((data?.currentPage ?? 1) - 1) * PAGE_SIZE + users.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {data?.totalUsers ?? 0}
                </span>{" "}
                {hasFilters ? "matching " : ""}
                users · Page {data?.currentPage ?? 1} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isInitializing}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg"
                >
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isInitializing}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg"
                >
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <Dialog
        open={Boolean(roleTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRoleTarget(null);
            setIsSubmitting(false);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card p-0 shadow-xl">
          <div className="p-6">
            <DialogHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-lime-100 text-green-700 dark:bg-green-900/40 dark:text-lime-300">
                <UserCog className="size-5" aria-hidden="true" />
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                Change user role
              </DialogTitle>
              <DialogDescription className="leading-6">
                Update the platform role for{" "}
                <span className="font-semibold text-foreground">
                  {roleTarget?.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current role
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-foreground">
                {roleTarget?.role}
              </p>
            </div>

            <label
              htmlFor="role-select"
              className="mt-4 block text-sm font-semibold text-foreground"
            >
              New role
            </label>
            <select
              id="role-select"
              value={nextRole}
              onChange={(event) => setNextRole(event.target.value as UserRole)}
              disabled={isSubmitting}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10 disabled:opacity-60"
            >
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>

            {roleTarget?.id === session?.user?.id && nextRole !== "admin" ? (
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                You cannot demote your own account.
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleTarget(null)}
              disabled={isSubmitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitRoleChange()}
              disabled={
                isSubmitting ||
                !roleTarget ||
                (roleTarget.id === session?.user?.id && nextRole !== "admin")
              }
              className="rounded-lg bg-[#166534] text-white hover:bg-[#14532D]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              Confirm role change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setConfirmedDelete(false);
            setIsSubmitting(false);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl border border-border bg-card p-0 shadow-xl">
          <div className="p-6">
            <DialogHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                <Trash2 className="size-5" aria-hidden="true" />
              </span>
              <DialogTitle className="text-lg font-bold text-foreground">
                Delete this account?
              </DialogTitle>
              <DialogDescription className="leading-6">
                This will permanently delete the account, sessions, and
                authentication records for the user below.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/20">
              <p className="font-bold text-foreground">{deleteTarget?.name}</p>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {deleteTarget?.email}
              </p>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <input
                type="checkbox"
                checked={confirmedDelete}
                onChange={(event) => setConfirmedDelete(event.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 size-4 shrink-0 accent-[#166534]"
              />
              <span className="text-xs leading-5 text-muted-foreground">
                I understand that this action is permanent and cannot be undone.
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isSubmitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void submitDelete()}
              disabled={isSubmitting || !confirmedDelete}
              className="rounded-lg"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllUsersPage;
