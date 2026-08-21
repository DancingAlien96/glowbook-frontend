"use client";

import { useMemo, useState } from "react";
import { money } from "../../_lib/format";
import type { PublicSalon } from "../../_lib/publicSalon";

// Public showcase of the salon's services — separate from the interactive
// booking wizard below it. Only renders when the salon has active services;
// a salon with none set up still gets a clean page, same rule as every
// other landing block.
export default function ServicesSection({ salon }: { salon: PublicSalon }) {
  const [activeCat, setActiveCat] = useState("Todos");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    salon.services.forEach((s) => cats.add(s.category ?? "Otros"));
    return ["Todos", ...Array.from(cats)];
  }, [salon.services]);

  const visible = activeCat === "Todos" ? salon.services : salon.services.filter((s) => (s.category ?? "Otros") === activeCat);

  if (salon.services.length === 0) return null;

  return (
    <section id="servicios" className="py-14 md:py-20 scroll-mt-24">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand)" }}>Nuestros servicios</p>
        <h2 className="font-serif text-3xl md:text-4xl text-mauve-900">Elige tus servicios</h2>
        <p className="mt-2 text-mauve-600">Puedes elegir más de uno para tu misma cita.</p>
      </div>

      {categories.length > 2 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCat(c)}
              className={`chip ${activeCat === c ? "bg-mauve-900 text-cream" : "chip-cream"} transition`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {visible.map((s) => (
          <a key={s.id} href="#reservar" className="group card-surface overflow-hidden hover:border-line-strong transition">
            <div className="relative h-44 overflow-hidden bg-mauve-900/5">
              {s.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="h-full w-full grid place-items-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mauve-400/60"><path d="M12 2a5 5 0 015 5c0 3-2 5-5 8-3-3-5-5-5-8a5 5 0 015-5z"/><circle cx="12" cy="7" r="1.5"/></svg>
                </div>
              )}
              {s.category && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-cream/90 backdrop-blur-sm text-[11px] font-medium text-mauve-800">
                  {s.category}
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-lg text-mauve-900 leading-snug">{s.name}</h3>
                <span className="text-sm font-semibold shrink-0" style={{ color: "var(--brand)" }}>{money(s.priceCents, salon.currency)}</span>
              </div>
              {s.description && <p className="text-sm text-mauve-600 mt-1.5 line-clamp-2">{s.description}</p>}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-mauve-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                {s.durationMin} min
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
