import { auth } from "@/lib/auth";
import {
  getEquipmentApiBaseUrl,
  unwrapApiData,
  type Equipment,
  type EquipmentInput,
} from "@/lib/equipment";

type RouteContext = { params: Promise<{ id: string }> };

const editableFields: Array<keyof EquipmentInput> = [
  "name",
  "category",
  "description",
  "rentalRate",
  "rentalPeriod",
  "availableStock",
  "brand",
  "model",
  "condition",
  "location",
  "rentalTerms",
  "imageUrls",
];

type AuthResult =
  | { session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>> }
  | { error: Response };

const requireOwner = async (request: Request): Promise<AuthResult> => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return {
      error: Response.json(
        { success: false, message: "You must be signed in." },
        { status: 401 },
      ),
    };
  }

  if (session.user.role !== "owner") {
    return {
      error: Response.json(
        { success: false, message: "Only owners can manage equipment." },
        { status: 403 },
      ),
    };
  }

  return { session };
};

const loadOwnedEquipment = async (
  id: string,
  email: string,
): Promise<{ equipment?: Equipment; error?: Response }> => {
  let backendResponse: Response;

  try {
    backendResponse = await fetch(
      `${getEquipmentApiBaseUrl()}/equipments/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
  } catch {
    return {
      error: Response.json(
        { success: false, message: "The equipment service is unavailable." },
        { status: 502 },
      ),
    };
  }

  if (backendResponse.status === 404) {
    return {
      error: Response.json(
        { success: false, message: "Equipment not found." },
        { status: 404 },
      ),
    };
  }

  if (!backendResponse.ok) {
    return {
      error: Response.json(
        { success: false, message: "Could not load this equipment." },
        { status: 502 },
      ),
    };
  }

  const equipment = unwrapApiData(await backendResponse.json()) as Equipment;

  if (equipment.owner?.email?.toLowerCase() !== email.toLowerCase()) {
    return {
      error: Response.json(
        { success: false, message: "You cannot manage this equipment." },
        { status: 403 },
      ),
    };
  }

  return { equipment };
};

export async function GET(request: Request, { params }: RouteContext) {
  const authResult = await requireOwner(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const { equipment, error } = await loadOwnedEquipment(
    id,
    authResult.session.user.email,
  );
  if (error) return error;

  return Response.json({ success: true, data: equipment });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const authResult = await requireOwner(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const { error } = await loadOwnedEquipment(id, authResult.session.user.email);
  if (error) return error;

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid body");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json(
      { success: false, message: "Invalid equipment data." },
      { status: 400 },
    );
  }

  const payload: Record<string, unknown> = {};
  for (const field of editableFields) {
    payload[field] =
      field === "imageUrls" && !Array.isArray(body[field]) ? [] : body[field];
  }

  try {
    const backendResponse = await fetch(
      `${getEquipmentApiBaseUrl()}/equipments/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const result = (await backendResponse.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!backendResponse.ok) {
      return Response.json(
        {
          success: false,
          message: result?.message ?? "Could not save your changes.",
        },
        { status: backendResponse.status },
      );
    }

    return Response.json(result, { status: backendResponse.status });
  } catch (backendError) {
    console.error("Could not update equipment", backendError);
    return Response.json(
      { success: false, message: "The equipment service is unavailable." },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const authResult = await requireOwner(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const { error } = await loadOwnedEquipment(id, authResult.session.user.email);
  if (error) return error;

  try {
    const backendResponse = await fetch(
      `${getEquipmentApiBaseUrl()}/equipments/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    const result = (await backendResponse.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!backendResponse.ok) {
      return Response.json(
        {
          success: false,
          message: result?.message ?? "Could not delete this equipment.",
        },
        { status: backendResponse.status },
      );
    }

    return Response.json(result, { status: backendResponse.status });
  } catch (backendError) {
    console.error("Could not delete equipment", backendError);
    return Response.json(
      { success: false, message: "The equipment service is unavailable." },
      { status: 502 },
    );
  }
}
