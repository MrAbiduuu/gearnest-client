import {
  getSessionUserId,
  hasPurchasedEquipment,
  isValidEquipmentId,
  toEquipmentObjectId,
} from "@/lib/purchases";

type RouteContext = { params: Promise<{ equipmentId: string }> };

/** GET /api/purchases/:equipmentId/status */
export async function GET(request: Request, { params }: RouteContext) {
  const userId = await getSessionUserId(request);

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
    const isPurchased = await hasPurchasedEquipment(userId, equipmentId);
    return Response.json({ success: true, data: { isPurchased } });
  } catch (error) {
    console.error("Could not check purchase status", error);
    return Response.json(
      { success: false, message: "Could not check purchase status." },
      { status: 500 },
    );
  }
}
