import { getCustomerBookings } from "@/lib/bookings";
import { getSessionUserIdFromHeaders } from "@/lib/purchases";

/** GET /api/bookings - the signed-in customer's own rental history. */
export async function GET(request: Request) {
  const userId = await getSessionUserIdFromHeaders(request.headers);

  if (!userId) {
    return Response.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );
  }

  try {
    const bookings = await getCustomerBookings(userId);
    return Response.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Could not load customer bookings", error);
    return Response.json(
      { success: false, message: "Could not load your bookings." },
      { status: 500 },
    );
  }
}
