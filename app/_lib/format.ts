export const money = (cents: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("es-EC", { style: "currency", currency }).format(
      (cents ?? 0) / 100
    );
  } catch {
    return `$${((cents ?? 0) / 100).toFixed(2)}`;
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
