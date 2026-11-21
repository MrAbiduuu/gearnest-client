/** Client helper for the authenticated customer's booking history. */
import type { CustomerBooking } from "@/lib/booking-types";
import { unwrapApiData } from "@/lib/equipment";

export class BookingsRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BookingsRequestError";
    this.status = status;
  }
}

export async function getMyBookings(
  signal?: AbortSignal,
): Promise<CustomerBooking[]> {
  const response = await fetch("/api/bookings", {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new BookingsRequestError(
      payload?.message ?? "Could not load your bookings.",
      response.status,
    );
  }

  const bookings = unwrapApiData(await response.json());
  if (!Array.isArray(bookings)) {
    throw new Error("The bookings API returned an unexpected response.");
  }

  return bookings as CustomerBooking[];
}
