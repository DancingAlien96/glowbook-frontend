export const money = (cents: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("es-EC", { style: "currency", currency }).format(
      (cents ?? 0) / 100
    );
  } catch {
    return `$${((cents ?? 0) / 100).toFixed(2)}`;
  }
};

/**
 * Like money() but without the .00 decimals — for round figures such as plan
 * prices ($20, $200, $1,000) where cents only add visual noise. Do NOT use for
 * service prices / deposits, which can have real cents.
 */
export const moneyWhole = (cents: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format((cents ?? 0) / 100);
  } catch {
    return `$${Math.round((cents ?? 0) / 100)}`;
  }
};

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

const dateTime = new Intl.DateTimeFormat("es-EC", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeOnly = new Intl.DateTimeFormat("es-EC", {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (iso: string | Date): string =>
  dateTime.format(typeof iso === "string" ? new Date(iso) : iso);

export const formatTime = (iso: string | Date): string =>
  timeOnly.format(typeof iso === "string" ? new Date(iso) : iso);
