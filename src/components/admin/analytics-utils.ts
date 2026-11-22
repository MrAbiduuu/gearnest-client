/** Shared presentation helpers for the admin analytics charts. */

export const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatCurrency = (amount: number, currency?: string) => {
  const code = (currency || "BDT").toUpperCase();

  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `৳${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
};

export const formatCompactCurrency = (amount: number, currency?: string) => {
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);

  return `${compact} ${(currency || "BDT").toUpperCase()}`;
};

export const getChartScale = (maxValue: number) => {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return { domainMax: 4, ticks: [0, 1, 2, 3, 4] };
  }

  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const multiplier = [1, 2, 2.5, 5, 10].find(
    (candidate) => candidate * magnitude >= roughStep,
  );
  const step = (multiplier ?? 10) * magnitude;
  const domainMax = Math.ceil(maxValue / step) * step;
  const tickCount = Math.round(domainMax / step);
  const ticks = Array.from(
    { length: Math.min(tickCount, 8) + 1 },
    (_, index) => Number((index * step).toFixed(6)),
  );

  return { domainMax, ticks };
};
