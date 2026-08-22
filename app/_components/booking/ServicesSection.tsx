import { money } from "../../_lib/format";
import type { PublicSalon } from "../../_lib/publicSalon";

const MAX_VISIBLE = 4;

// Public showcase of the salon's services — separate from the interactive
// booking wizard below it. Capped to a handful so the landing page doesn't
// get overwhelmed with a long catalog; the full list still lives in the
// booking wizard's own service picker. Only renders when the salon has
// active services; a salon with none set up still gets a clean page, same
// rule as every other landing block.
export default function ServicesSection({ salon }: { salon: PublicSalon }) {
  const visible = salon.services.slice(0, MAX_VISIBLE);

  if (salon.services.length === 0) return null;

  return (
    <section id="servicios" className="py-14 md:py-20 scroll-mt-24">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand)" }}>Nuestros servicios</p>
        <h2 className="font-serif text-3xl md:text-4xl text-mauve-900">Elige tus servicios</h2>
        <p className="mt-2 text-mauve-600">Puedes elegir más de uno para tu misma cita.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-5xl mx-auto">
        {visible.map((s) => (
          <a key={s.id} href="#reservar" className="group card-surface overflow-hidden hover:border-line-strong transition">
            <div className="relative h-32 sm:h-44 overflow-hidden bg-mauve-900/5">
              {s.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="h-full w-full grid place-items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mauve-400/60"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
              )}
              {s.category && (
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-cream/90 backdrop-blur-sm text-[10px] sm:text-[11px] font-medium text-mauve-800">
                  {s.category}
                </span>
              )}
            </div>
            <div className="p-2.5 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-sm sm:text-lg text-mauve-900 leading-snug">{s.name}</h3>
                <span className="text-xs sm:text-sm font-semibold shrink-0" style={{ color: "var(--brand)" }}>{money(s.priceCents, salon.currency)}</span>
              </div>
              {s.description && <p className="hidden sm:block text-sm text-mauve-600 mt-1.5 line-clamp-2">{s.description}</p>}
              <div className="mt-1.5 sm:mt-3 flex items-center gap-1.5 text-[11px] sm:text-xs text-mauve-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="sm:w-[13px] sm:h-[13px]"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                {s.durationMin} min
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
