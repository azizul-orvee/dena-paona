export const CURRENCY_SYMBOL = "৳"; // Bangladeshi taka sign
export const CURRENCY_CODE = "BDT";
export const LOCALE = "en-BD";

/** Drizzle returns `numeric` columns as strings; normalise safely. */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Rounds to 2dp without binary-float drift for realistic personal amounts. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatAmount(value: string | number | null | undefined) {
  const n = toNumber(value);
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatMoney(value: string | number | null | undefined) {
  return `${CURRENCY_SYMBOL}${formatAmount(value)}`;
}

/** Compact form for tight spots: ৳1.2L, ৳45.3k */
export function formatCompact(value: string | number | null | undefined) {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 10_000_000) return `${sign}${CURRENCY_SYMBOL}${round2(abs / 10_000_000)}Cr`;
  if (abs >= 100_000) return `${sign}${CURRENCY_SYMBOL}${round2(abs / 100_000)}L`;
  if (abs >= 1_000) return `${sign}${CURRENCY_SYMBOL}${round2(abs / 1_000)}k`;
  return `${sign}${formatMoney(abs)}`;
}
