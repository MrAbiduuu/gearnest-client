/** Client helper for checking whether the signed-in customer bought an item. */
import { unwrapApiData } from "@/lib/equipment";

export async function checkPurchaseStatus(
  equipmentId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const response = await fetch(
    `/api/purchases/${encodeURIComponent(equipmentId)}/status`,
    { signal, cache: "no-store" },
  );

  if (!response.ok) {
    if (response.status === 401) return false;

    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(payload?.message ?? "Could not check purchase status.");
  }

  const data = unwrapApiData(await response.json()) as {
    isPurchased?: unknown;
  } | null;

  return data?.isPurchased === true;
}
