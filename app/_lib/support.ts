// Single source of truth for the "contact us / tech support" identity.
// Update the values here and every CTA across the landing + dashboard
// automatically points to the new contact.

/** Pretty form used in copy: "+502 3307 4483". */
export const SUPPORT_WHATSAPP_DISPLAY = "+502 3307 4483";

/** Digits-only form used in wa.me URLs: country code + number, no symbols. */
export const SUPPORT_WHATSAPP_DIGITS = "50233074483";

/** Build a wa.me deep link with an optional pre-baked message. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${SUPPORT_WHATSAPP_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Convenience pre-baked openers for common contexts. */
export const SUPPORT_MESSAGES = {
  general: "Hola Ecodama, necesito ayuda con mi salón.",
  billing: "Hola Ecodama, tengo una consulta sobre mi suscripción.",
  signup: "Hola Ecodama, quiero activar mi salón en la plataforma.",
} as const;
