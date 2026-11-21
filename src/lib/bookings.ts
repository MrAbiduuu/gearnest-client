/**
 * Server-side booking history.
 *
 * A booking is the `purchases` document created after Stripe confirms payment.
 * The user ID always comes from the Better Auth session, so one customer can
 * never read another customer's bookings. Equipment details are enriched from
 * the equipment service in a single request, like the favorites loader.
 */
import type { ObjectId } from "mongodb";
import { db } from "@/lib/auth";
import type {
  BookingPaymentStatus,
  BookingStatus,
  CustomerBooking,
} from "@/lib/booking-types";
import { fetchEquipments } from "@/lib/equipment";
import { inclusiveDayCount } from "@/lib/rental-pricing";

type PurchaseBookingDocument = {
  _id?: ObjectId;
  userId: string;
  equipmentId: ObjectId;
  amountTotal?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  deliveryAddress?: string;
  status?: string;
  paymentStatus?: string;
  refundedAt?: Date;
  createdAt?: Date;
};

const BOOKINGS_COLLECTION = "purchases";

const normalizeStatus = (value?: string): BookingStatus => {
  switch (value?.toLowerCase()) {
    case "pending":
      return "pending";
    case "cancelled":
    case "canceled":
      return "cancelled";
    default:
      // Purchases are only written after Stripe reports a paid session.
      return "confirmed";
  }
};

const normalizePaymentStatus = (
  booking: PurchaseBookingDocument,
): BookingPaymentStatus => {
  const value = booking.paymentStatus?.toLowerCase();

  if (value === "unpaid" || value === "refunded") return value;
  if (booking.refundedAt) return "refunded";

  return "paid";
};

export const getCustomerBookings = async (
  userId: string,
): Promise<CustomerBooking[]> => {
  const documents = await db
    .collection<PurchaseBookingDocument>(BOOKINGS_COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  if (documents.length === 0) return [];

  let equipments = [] as Awaited<ReturnType<typeof fetchEquipments>>;
  try {
    equipments = await fetchEquipments();
  } catch (error) {
    // Keep the history usable with IDs if the equipment service is offline.
    console.error("Could not load equipment for booking history", error);
  }

  const equipmentsById = new Map(
    equipments.map((equipment) => [equipment._id, equipment]),
  );

  return documents.map((document) => {
    const equipmentId = document.equipmentId?.toString() ?? "";
    const equipment = equipmentsById.get(equipmentId);
    const status = normalizeStatus(document.status);
    const paymentStatus = normalizePaymentStatus(document);
    const quantity =
      Number.isInteger(document.quantity) && Number(document.quantity) > 0
        ? Number(document.quantity)
        : 1;

    return {
      id: document._id?.toString() ?? "",
      equipmentId,
      equipmentName: equipment?.name?.trim() || "Equipment unavailable",
      equipmentImage: equipment?.image || equipment?.images?.[0] || undefined,
      status,
      paymentStatus,
      startDate: document.startDate,
      endDate: document.endDate,
      days:
        document.startDate && document.endDate
          ? inclusiveDayCount(document.startDate, document.endDate)
          : 0,
      quantity,
      deliveryAddress: document.deliveryAddress?.trim() || undefined,
      totalAmount:
        typeof document.amountTotal === "number"
          ? document.amountTotal / 100
          : 0,
      createdAt: document.createdAt?.toISOString(),
      canReview: status === "confirmed" && paymentStatus === "paid",
    };
  });
};
