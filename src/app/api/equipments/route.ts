import { auth } from "@/lib/auth";

const equipmentFields = [
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
] as const;

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_EQUIPMENT_API_URL ?? "http://localhost:5000").replace(
    /\/+$/,
    "",
  );

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json(
      { success: false, message: "You must be signed in to publish equipment." },
      { status: 401 },
    );
  }

  if (session.user.role !== "owner") {
    return Response.json(
      { success: false, message: "Only owners can publish equipment." },
      { status: 403 },
    );
  }

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
  for (const field of equipmentFields) {
    payload[field] =
      field === "imageUrls" && !Array.isArray(body[field]) ? [] : body[field];
  }

  // Owner details come from the authenticated session, never from the form.
  payload.owner = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    isVerified: true,
  };

  try {
    const backendResponse = await fetch(`${getApiBaseUrl()}/equipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = (await backendResponse.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!backendResponse.ok) {
      return Response.json(
        {
          success: false,
          message: result?.message ?? "Failed to publish equipment.",
        },
        { status: backendResponse.status },
      );
    }

    return Response.json(result, { status: backendResponse.status });
  } catch (error) {
    console.error("Equipment publish failed", error);
    return Response.json(
      { success: false, message: "The equipment service is unavailable." },
      { status: 502 },
    );
  }
}
