/** Shared booking view types used by the server loader and the dashboard UI. */

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type BookingPaymentStatus = "paid" | "unpaid" | "refunded";

export type CustomerBooking = {
  /** Purchase document ID, shown to the customer as the booking ID. */
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentImage?: string;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  /** Date-only ISO strings (YYYY-MM-DD). */
  startDate?: string;
  endDate?: string;
  days: number;
  quantity: number;
  deliveryAddress?: string;
  /** Total in BDT major units (Stripe stores the amount in minor units). */
  totalAmount: number;
  createdAt?: string;
  canReview: boolean;
};
