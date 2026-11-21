import {
  addFavorite,
  equipmentExists,
  getSessionUserId,
  isValidEquipmentId,
  removeFavorite,
  toEquipmentObjectId,
} from "@/lib/favorites";

type RouteContext = { params: Promise<{ equipmentId: string }> };

const validateId = (rawId: string) => {
  const equipmentId = toEquipmentObjectId(rawId);
  if (!equipmentId || !isValidEquipmentId(rawId)) return null;
  return equipmentId;
};

/** POST /api/favorites/:equipmentId */
export async function POST(request: Request, { params }: RouteContext) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return Response.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );
  }

  const { equipmentId: rawId } = await params;
  const equipmentId = validateId(rawId);
  if (!equipmentId) {
    return Response.json(
      { success: false, message: "Invalid equipment ID." },
      { status: 400 },
    );
  }

  try {
    const exists = await equipmentExists(rawId);
    if (!exists) {
      return Response.json(
        { success: false, message: "Equipment not found." },
        { status: 404 },
      );
    }

    await addFavorite(userId, equipmentId);

    return Response.json({
      success: true,
      data: { equipmentId: rawId },
      message: "Equipment added to favorites.",
    });
  } catch (error) {
    console.error("Could not add favorite", error);
    return Response.json(
      { success: false, message: "Could not add this equipment to favorites." },
      { status: 500 },
    );
  }
}

/** DELETE /api/favorites/:equipmentId - only for the signed-in user. */
export async function DELETE(request: Request, { params }: RouteContext) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    return Response.json(
      { success: false, message: "You must be signed in." },
      { status: 401 },
    );
  }

  const { equipmentId: rawId } = await params;
  const equipmentId = validateId(rawId);
  if (!equipmentId) {
    return Response.json(
      { success: false, message: "Invalid equipment ID." },
      { status: 400 },
    );
  }

  try {
    const removed = await removeFavorite(userId, equipmentId);

    return Response.json({
      success: true,
      data: { equipmentId: rawId, removed },
      message: "Equipment removed from favorites.",
    });
  } catch (error) {
    console.error("Could not remove favorite", error);
    return Response.json(
      {
        success: false,
        message: "Could not remove this equipment from favorites.",
      },
      { status: 500 },
    );
  }
}
