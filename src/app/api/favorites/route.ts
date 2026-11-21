import { getFavoriteEquipments, getSessionUserId } from "@/lib/favorites";

/** GET /api/favorites - populated favorites of the signed-in customer only. */
export async function GET(request: Request) {
  const userId = await getSessionUserId(request);

  if (!userId) {
    return Response.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );
  }

  try {
    const equipments = await getFavoriteEquipments(userId);
    return Response.json({ success: true, data: equipments });
  } catch (error) {
    console.error("Could not load favorites", error);
    return Response.json(
      { success: false, message: "Could not load your favorites." },
      { status: 500 },
    );
  }
}
