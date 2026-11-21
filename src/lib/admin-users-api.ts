/**
 * Client helper for the admin-only user management API on the Express backend.
 * The Better Auth session cookie is sent with every request (credentials are
 * never proxied through the URL or a header), and authorization is enforced
 * again by the backend on every call.
 */
import { getEquipmentApiBaseUrl } from "@/lib/equipment";

export type UserRole = "customer" | "owner" | "admin";
export type UserRoleFilter = "all" | UserRole;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  address: string;
  phone: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type UsersListData = {
  users: AdminUser[];
  totalUsers: number;
  totalRegisteredUsers: number;
  roleCounts: Record<UserRoleFilter, number>;
  currentPage: number;
  totalPages: number;
  limit: number;
};

export type UsersListResponse = {
  success: boolean;
  message: string;
  data: UsersListData;
};

export class AdminUsersRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminUsersRequestError";
    this.status = status;
  }
}

const getMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  return payload?.message ?? fallback;
};

const apiUrl = (path: string) => `${getEquipmentApiBaseUrl()}${path}`;

export async function fetchAdminUsers(
  params: {
    role: UserRoleFilter;
    search: string;
    page: number;
    limit: number;
  },
  signal?: AbortSignal,
): Promise<UsersListResponse> {
  const query = new URLSearchParams({
    role: params.role,
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  });

  const response = await fetch(apiUrl(`/users?${query.toString()}`), {
    signal,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AdminUsersRequestError(
      await getMessage(response, "Could not load users."),
      response.status,
    );
  }

  return (await response.json()) as UsersListResponse;
}

export async function updateAdminUserRole(
  userId: string,
  role: UserRole,
): Promise<{ message: string; user: AdminUser | null }> {
  const response = await fetch(apiUrl(`/users/${encodeURIComponent(userId)}/role`), {
    method: "PATCH",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role }),
  });

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    data?: AdminUser;
  } | null;

  if (!response.ok) {
    throw new AdminUsersRequestError(
      payload?.message ?? "Could not update this user's role.",
      response.status,
    );
  }

  return {
    message: payload?.message ?? "Role updated successfully.",
    user: payload?.data ?? null,
  };
}

export async function deleteAdminUser(
  userId: string,
): Promise<{ message: string }> {
  const response = await fetch(apiUrl(`/users/${encodeURIComponent(userId)}`), {
    method: "DELETE",
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    throw new AdminUsersRequestError(
      payload?.message ?? "Could not delete this user.",
      response.status,
    );
  }

  return { message: payload?.message ?? "User deleted successfully." };
}
