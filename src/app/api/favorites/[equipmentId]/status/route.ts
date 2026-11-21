import {
  getSessionUserId,
  hasFavorite,
  isValidEquipmentId,
  toEquipmentObjectId,
} from "@/lib/favorites";

type RouteContext = { params: Promise<{ equipmentId: string }> };

/** GET /api/favorites/:equipmentId/status */
export async function GET(request: Request, { params }: RouteContext) {
  let userId: string | null;

  try {
    userId = await getSessionUserId(request);
  } catch (error) {
    console.error("Could not verify session for favorites", error);
    return Response.json(
      { success: false, message: "Could not verify your session." },
      { status: 401 },
    );
  }

  if (!userId) {
    return Response.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );
  }

  const { equipmentId: rawId } = await params;
  const equipmentId = toEquipmentObjectId(rawId);
  if (!equipmentId || !isValidEquipmentId(rawId)) {
    return Response.json(
      { success: false, message: "Invalid equipment ID." },
      { status: 400 },
    );
  }

  try {
    const isFavorite = await hasFavorite(userId, equipmentId);
    return Response.json({ success: true, data: { isFavorite } });
  } catch (error) {
    console.error("Could not check favorite status", error);
    return Response.json(
      { success: false, message: "Could not check favorite status." },
      { status: 500 },
    );
  }
}
