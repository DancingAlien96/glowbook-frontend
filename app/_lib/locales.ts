// Catalogue of timezones + currencies surfaced in the salon settings UI.
// Curated for our actual market: Latin America with full Central America
// coverage. The arrays double as the canonical labels shown in selects.
//
// We separate IANA timezone from human label so the data we store is the
// official IANA name (correct for date formatting via Intl.DateTimeFormat).

export type TimezoneOption = {
  /** IANA timezone identifier — what we store in DB. */
  tz: string;
  /** Human-friendly label shown in selects. */
  label: string;
};

export type CurrencyOption = {
  /** ISO 4217 code — what we store in DB. */
  code: string;
  /** Human-friendly label shown in selects. */
  label: string;
};

// Grouped by region for readability when scanning the dropdown.
// Central America is listed first because it's the market we just added.
export const TIMEZONES: TimezoneOption[] = [
  // Centroamérica (UTC-6, excepto Panamá UTC-5)
  { tz: "America/Guatemala",   label: "Guatemala · GMT-6" },
  { tz: "America/Belize",      label: "Belice · GMT-6" },
  { tz: "America/El_Salvador", label: "El Salvador · GMT-6" },
  { tz: "America/Tegucigalpa", label: "Honduras · GMT-6" },
  { tz: "America/Managua",     label: "Nicaragua · GMT-6" },
  { tz: "America/Costa_Rica",  label: "Costa Rica · GMT-6" },
  { tz: "America/Panama",      label: "Panamá · GMT-5" },

  // México (varias zonas — la mayoría usa Mexico_City)
  { tz: "America/Mexico_City", label: "México (Centro) · GMT-6" },
  { tz: "America/Cancun",      label: "México (Cancún / Q. Roo) · GMT-5" },
  { tz: "America/Tijuana",     label: "México (Tijuana / Baja) · GMT-8" },

  // Caribe
  { tz: "America/Santo_Domingo", label: "República Dominicana · GMT-4" },
  { tz: "America/Havana",        label: "Cuba · GMT-5" },
  { tz: "America/Puerto_Rico",   label: "Puerto Rico · GMT-4" },

  // Sudamérica
  { tz: "America/Guayaquil",     label: "Ecuador · GMT-5" },
  { tz: "America/Lima",          label: "Perú · GMT-5" },
  { tz: "America/Bogota",        label: "Colombia · GMT-5" },
  { tz: "America/Caracas",       label: "Venezuela · GMT-4" },
  { tz: "America/La_Paz",        label: "Bolivia · GMT-4" },
  { tz: "America/Asuncion",      label: "Paraguay · GMT-3/4" },
  { tz: "America/Santiago",      label: "Chile · GMT-3/4" },
  { tz: "America/Argentina/Buenos_Aires", label: "Argentina · GMT-3" },
  { tz: "America/Montevideo",    label: "Uruguay · GMT-3" },
  { tz: "America/Sao_Paulo",     label: "Brasil · GMT-3" },
];

export const CURRENCIES: CurrencyOption[] = [
  // Multi-país (lo más usado primero)
  { code: "USD", label: "USD · Dólar estadounidense" },

  // Centroamérica
  { code: "GTQ", label: "GTQ · Quetzal guatemalteco" },
  { code: "BZD", label: "BZD · Dólar beliceño" },
  { code: "HNL", label: "HNL · Lempira hondureño" },
  { code: "NIO", label: "NIO · Córdoba nicaragüense" },
  { code: "CRC", label: "CRC · Colón costarricense" },
  { code: "PAB", label: "PAB · Balboa panameño" },

  // México y Caribe
  { code: "MXN", label: "MXN · Peso mexicano" },
  { code: "DOP", label: "DOP · Peso dominicano" },

  // Sudamérica
  { code: "PEN", label: "PEN · Sol peruano" },
  { code: "COP", label: "COP · Peso colombiano" },
  { code: "CLP", label: "CLP · Peso chileno" },
  { code: "ARS", label: "ARS · Peso argentino" },
  { code: "UYU", label: "UYU · Peso uruguayo" },
  { code: "BOB", label: "BOB · Boliviano" },
  { code: "PYG", label: "PYG · Guaraní paraguayo" },
  { code: "BRL", label: "BRL · Real brasileño" },
  { code: "VES", label: "VES · Bolívar venezolano" },
];

/**
 * Ensure the currently-saved value is always present as an option, even if
 * we ever remove it from the catalogue — avoids silent data loss when a
 * dueña opens her settings and the current value would otherwise disappear.
 */
export function withTimezone(current: string | undefined): TimezoneOption[] {
  if (!current || TIMEZONES.some((t) => t.tz === current)) return TIMEZONES;
  return [{ tz: current, label: current }, ...TIMEZONES];
}

export function withCurrency(current: string | undefined): CurrencyOption[] {
  if (!current || CURRENCIES.some((c) => c.code === current)) return CURRENCIES;
  return [{ code: current, label: current }, ...CURRENCIES];
}
