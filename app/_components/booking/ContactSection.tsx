import { safeHttpUrl } from "../../_lib/safeUrl";
import type { PublicSalon } from "../../_lib/publicSalon";

export default function ContactSection({ salon }: { salon: PublicSalon }) {
  const instagramUrl = safeHttpUrl(salon.instagramUrl);
  const facebookUrl = safeHttpUrl(salon.facebookUrl);
  const phoneDigits = salon.contactPhone?.replace(/\D/g, "");
  const whatsappDigits = salon.whatsappContact?.replace(/\D/g, "");

  const cards = [
    salon.contactPhone && {
      icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
      label: "Teléfono",
      value: salon.contactPhone,
      href: `tel:${phoneDigits}`,
    },
    salon.contactEmail && {
      icon: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
      label: "Email",
      value: salon.contactEmail,
      href: `mailto:${salon.contactEmail}`,
    },
    salon.address && {
      icon: <><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
      label: "Dirección",
      value: salon.address,
      href: null,
    },
    salon.whatsappContact && {
      icon: null,
      isWhatsapp: true,
      label: "WhatsApp",
      value: salon.whatsappContact,
      href: `https://wa.me/${whatsappDigits}`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string | null; isWhatsapp?: boolean }[];

  if (cards.length === 0 && !instagramUrl && !facebookUrl) return null;

  return (
    <section id="contacto" className="py-14 md:py-20">
      <div className="rounded-[2rem] p-6 sm:p-10 md:p-12 text-center" style={{ backgroundColor: "var(--brand)" }}>
        <h2 className="font-serif text-3xl md:text-4xl text-cream">¿Lista para tu transformación?</h2>
        <p className="mt-2 text-cream/85 max-w-lg mx-auto text-sm md:text-base">
          Contáctanos por cualquiera de nuestros canales, o reserva directo.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
          {cards.map((c) => {
            const inner = (
              <>
                <div className="h-10 w-10 rounded-full bg-cream/15 grid place-items-center shrink-0">
                  {c.isWhatsapp ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-cream"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-cream">{c.icon}</svg>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-cream/70">{c.label}</div>
                  <div className="text-sm font-medium text-cream leading-snug break-words">{c.value}</div>
                </div>
              </>
            );
            return c.href ? (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-cream/10 backdrop-blur-sm p-4 hover:bg-cream/15 transition">
                {inner}
              </a>
            ) : (
              <div key={c.label} className="flex items-center gap-3 rounded-2xl bg-cream/10 backdrop-blur-sm p-4">
                {inner}
              </div>
            );
          })}
        </div>

        {(instagramUrl || facebookUrl) && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-cream/15 grid place-items-center text-cream hover:bg-cream/25 transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/></svg>
              </a>
            )}
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-cream/15 grid place-items-center text-cream hover:bg-cream/25 transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
            )}
          </div>
        )}

        <a href="#reservar" className="btn mt-8 h-11 px-8 inline-flex bg-cream text-mauve-900 hover:bg-cream/90">
          Reservar ahora
        </a>
      </div>
    </section>
  );
}
