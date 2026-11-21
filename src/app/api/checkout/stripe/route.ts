import { auth } from "@/lib/auth";
import { fetchEquipmentById } from "@/lib/equipment";
import {
  hasPurchasedEquipment,
  isValidEquipmentId,
  toEquipmentObjectId,
} from "@/lib/purchases";
import { getRentalQuote } from "@/lib/rental-pricing";

/** Creates a Stripe Checkout session and returns its hosted payment URL. */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json(
      { success: false, message: "You must be signed in to check out." },
      { status: 401 },
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
      { success: false, message: "Invalid checkout details." },
      { status: 400 },
    );
  }

  const equipmentId =
    typeof body.equipmentId === "string" ? body.equipmentId : "";
  const startDate = typeof body.startDate === "string" ? body.startDate : "";
  const endDate = typeof body.endDate === "string" ? body.endDate : "";
  const quantity = Number(body.quantity);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (
    !equipmentId ||
    !isValidEquipmentId(equipmentId) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return Response.json(
      {
        success: false,
        message: "Provide a valid equipment ID and contact email.",
      },
      { status: 400 },
    );
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return Response.json(
      { success: false, message: "Invalid rental quantity." },
      { status: 400 },
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      {
        success: false,
        message:
          "Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable payments.",
      },
      { status: 503 },
    );
  }

  try {
    const equipment = await fetchEquipmentById(equipmentId);
    if (!equipment) {
      return Response.json(
        { success: false, message: "This equipment is no longer available." },
        { status: 404 },
      );
    }

    if (quantity > Math.max(0, Math.floor(equipment.availableStock ?? 0))) {
      return Response.json(
        { success: false, message: "Requested quantity is not available." },
        { status: 400 },
      );
    }

    const equipmentObjectId = toEquipmentObjectId(equipmentId);
    if (
      equipmentObjectId &&
      (await hasPurchasedEquipment(session.user.id, equipmentObjectId))
    ) {
      return Response.json(
        {
          success: false,
          message: "You already completed checkout for this equipment.",
        },
        { status: 409 },
      );
    }

    const quote = getRentalQuote({
      rentalRate: equipment.rentalRate,
      rentalPeriod: equipment.rentalPeriod,
      startDate,
      endDate,
      quantity,
    });

    if (!quote || quote.rentalCost <= 0) {
      return Response.json(
        { success: false, message: "Invalid rental dates or amount." },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;
    const cancelParams = new URLSearchParams({
      equipmentId,
      startDate,
      endDate,
      quantity: String(quantity),
    });

    const form = new URLSearchParams({
      mode: "payment",
      customer_email: email,
      client_reference_id: session.user.id,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": (
        process.env.STRIPE_CURRENCY ?? "bdt"
      ).toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(
        Math.round(quote.rentalCost * 100),
      ),
      "line_items[0][price_data][product_data][name]": `${equipment.name} rental`,
      "line_items[0][price_data][product_data][description]":
        `${startDate} to ${endDate} · ${quantity} unit(s) · ${quote.period} billing`,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?${cancelParams.toString()}`,
      "metadata[userId]": session.user.id,
      "metadata[equipmentId]": equipmentId,
      "metadata[startDate]": startDate,
      "metadata[endDate]": endDate,
      "metadata[quantity]": String(quantity),
    });

    if (name) form.set("metadata[name]", name);

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: form.toString(),
      },
    );

    const result = (await stripeResponse.json().catch(() => null)) as {
      url?: string;
      error?: { message?: string };
    } | null;

    if (!stripeResponse.ok || !result?.url) {
      return Response.json(
        {
          success: false,
          message: result?.error?.message ?? "Could not start Stripe checkout.",
        },
        { status: 502 },
      );
    }

    return Response.json({ success: true, url: result.url });
  } catch (error) {
    console.error("Could not create Stripe checkout session", error);
    return Response.json(
      { success: false, message: "Could not start Stripe checkout." },
      { status: 502 },
    );
  }
}
