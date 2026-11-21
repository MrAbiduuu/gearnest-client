/** Shared rental date/price helpers used by booking and checkout. */

export const PERIOD_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const periodLabel = (value: string) =>
  PERIOD_LABELS[value.toLowerCase()] ?? value ?? "Daily";

export const periodInDays = (value: string) => {
  switch (value.toLowerCase()) {
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    default:
      return 1;
  }
};

const toDateParts = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
};

export const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

export const addDays = (value: string, days: number) => {
  const { year, month, day } = toDateParts(value);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
};

export const inclusiveDayCount = (start: string, end: string) => {
  if (!isIsoDate(start) || !isIsoDate(end)) return 0;

  const difference =
    Date.UTC(...toDatePartsAsTuple(end)) - Date.UTC(...toDatePartsAsTuple(start));

  return Math.max(0, Math.floor(difference / 86_400_000) + 1);
};

const toDatePartsAsTuple = (value: string): [number, number, number] => {
  const { year, month, day } = toDateParts(value);
  return [year, month - 1, day];
};

export type RentalQuoteInput = {
  rentalRate: number;
  rentalPeriod: string;
  startDate: string;
  endDate: string;
  quantity: number;
};

export type RentalQuote = {
  days: number;
  billingUnits: number;
  rentalCost: number;
  period: string;
  periodUnit: string;
  rate: number;
  quantity: number;
};

/** Returns null when the submitted rental details are invalid. */
export const getRentalQuote = ({
  rentalRate,
  rentalPeriod,
  startDate,
  endDate,
  quantity,
}: RentalQuoteInput): RentalQuote | null => {
  const rate = Number(rentalRate);
  const units = Number(quantity);

  if (
    !isIsoDate(startDate) ||
    !isIsoDate(endDate) ||
    endDate < startDate ||
    !Number.isFinite(rate) ||
    rate < 0 ||
    !Number.isInteger(units) ||
    units < 1
  ) {
    return null;
  }

  const days = inclusiveDayCount(startDate, endDate);
  const billingUnits = Math.ceil(days / periodInDays(rentalPeriod));

  return {
    days,
    billingUnits,
    rentalCost: billingUnits * rate * units,
    period: periodLabel(rentalPeriod),
    periodUnit: (rentalPeriod || "daily").toLowerCase(),
    rate,
    quantity: units,
  };
};
