import { initials } from "../../_lib/format";
import { safeHttpUrl } from "../../_lib/safeUrl";
import type { PublicSalon } from "../../_lib/publicSalon";

export default function PublicFooter({
  salon,
  sections,
}: {
  salon: PublicSalon;
  sections: { id: string; label: string }[];
}) {
  const instagramUrl = safeHttpUrl(salon.instagramUrl);
  const facebookUrl = safeHttpUrl(salon.facebookUrl);
  const hasSocial = !!(instagramUrl || facebookUrl || salon.whatsappContact);
  const hasContact = !!(salon.address || salon.contactPhone || salon.contactEmail);
  const year = new Date().getFullYear();

  const topServices = salon.services.slice(0, 5);

  return (
    <footer className="mt-16 md:mt-20 border-t border-line pt-10 md:pt-14 pb-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-full grid place-items-center text-cream font-serif text-sm"
              style={{ backgroundColor: "var(--brand)" }}
            >
              {initials(salon.name)}
            </div>
            <span className="font-serif text-lg text-mauve-900">{salon.name}</span>
          </div>
          {salon.tagline && <p className="mt-3 text-sm text-mauve-600 leading-relaxed">{salon.tagline}</p>}
          {hasSocial && (
            <div className="mt-4 flex items-center gap-2.5">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-600 hover:bg-mauve-900/10 hover:text-mauve-900 transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/></svg>
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-600 hover:bg-mauve-900/10 hover:text-mauve-900 transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
              )}
              {salon.whatsappContact && (
                <a href={`https://wa.me/${salon.whatsappContact.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-600 hover:bg-mauve-900/10 hover:text-mauve-900 transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-mauve-400 mb-3">Enlaces</h4>
          <ul className="space-y-2">
            {[{ id: "inicio", label: "Inicio" }, ...sections].map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-mauve-600 hover:text-mauve-900 transition">{s.label}</a>
              </li>
            ))}
            <li>
              <a href="#reservar" className="text-sm text-mauve-600 hover:text-mauve-900 transition">Reservar cita</a>
            </li>
          </ul>
        </div>

        {topServices.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-mauve-400 mb-3">Servicios</h4>
            <ul className="space-y-2">
              {topServices.map((s) => (
                <li key={s.id} className="text-sm text-mauve-600">{s.name}</li>
              ))}
            </ul>
          </div>
        )}

        {hasContact && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-mauve-400 mb-3">Contacto</h4>
            <ul className="space-y-2.5">
              {salon.address && (
                <li className="text-sm text-mauve-600 leading-relaxed">{salon.address}</li>
              )}
              {salon.contactPhone && (
                <li><a href={`tel:${salon.contactPhone.replace(/\D/g, "")}`} className="text-sm text-mauve-600 hover:text-mauve-900 transition">{salon.contactPhone}</a></li>
              )}
              {salon.contactEmail && (
                <li><a href={`mailto:${salon.contactEmail}`} className="text-sm text-mauve-600 hover:text-mauve-900 transition break-all">{salon.contactEmail}</a></li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-line text-center text-xs text-mauve-400">
        © {year} {salon.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
