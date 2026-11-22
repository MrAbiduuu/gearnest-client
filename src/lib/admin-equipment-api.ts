/**
 * Admin-only equipment moderation helper. Calls go through the Next.js backend
 * proxy, which attaches a short-lived JWT; Express re-checks the admin role.
 */
import { authenticatedFetch } from "@/lib/authenticated-api";
import type { Equipment, EquipmentStatus } from "@/lib/equipment";

type ModerationResponse = {
  success: boolean;
  message: string;
  data: Equipment;
};

const getErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (response.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (response.status === 403) {
    return "You do not have permission to review equipment listings.";
  }

  return payload?.message ?? fallback;
};

export async function updateAdminEquipmentStatus(
  id: string,
  status: EquipmentStatus,
): Promise<Equipment> {
  const response = await authenticatedFetch(
    `/admin/equipments/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Could not update this listing."));
  }

  const payload = (await response.json()) as ModerationResponse;
  return payload.data;
}
