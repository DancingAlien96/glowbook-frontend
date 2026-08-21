"use client";

import { useEffect, useState } from "react";
import { initials } from "../../_lib/format";
import type { PublicSalon } from "../../_lib/publicSalon";

// Sticky one-page nav — transparent over the hero, solid once scrolled.
// Only lists anchors for sections that actually exist on this salon's page
// (built up by the caller from what data is present), so a salon that
// hasn't filled anything in still gets a clean, honest nav.
export default function PublicNavbar({
  salon,
  sections,
  onShare,
}: {
  salon: PublicSalon;
  sections: { id: string; label: string }[];
  onShare: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur-md border-b border-line shadow-[var(--shadow-soft)]" : "bg-transparent"
      }`}
    >
      <div className="container-tight">
        <div className="flex items-center justify-between h-16 md:h-18">
          <a href="#inicio" className="flex items-center gap-2 min-w-0">
            <div
              className="h-8 w-8 md:h-9 md:w-9 rounded-full grid place-items-center text-cream font-serif text-sm shrink-0 ring-1 ring-cream/30"
              style={{ backgroundColor: scrolled ? "var(--brand)" : "rgba(255,255,255,0.15)" }}
            >
              {initials(salon.name)}
            </div>
            <span className={`font-serif text-base md:text-lg leading-tight truncate transition-colors ${scrolled ? "text-mauve-900" : "text-cream"}`}>
              {salon.name}
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`text-sm font-medium transition-colors ${scrolled ? "text-mauve-600 hover:text-mauve-900" : "text-cream/85 hover:text-cream"}`}
              >
                {s.label}
              </a>
            ))}
            <button
              type="button"
              onClick={onShare}
              className={`text-sm font-medium transition-colors ${scrolled ? "text-mauve-600 hover:text-mauve-900" : "text-cream/85 hover:text-cream"}`}
            >
              Compartir
            </button>
            <a href="#reservar" className="btn btn-primary h-10 text-sm px-5">
              Reservar cita
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={`lg:hidden h-10 w-10 grid place-items-center transition-colors ${scrolled ? "text-mauve-800" : "text-cream"}`}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-cream/98 backdrop-blur-md border-t border-line">
          <div className="container-tight py-4 flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-mauve-700 hover:text-mauve-900 py-2.5"
              >
                {s.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); onShare(); }}
              className="text-left text-sm font-medium text-mauve-700 hover:text-mauve-900 py-2.5"
            >
              Compartir
            </button>
            <a
              href="#reservar"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary h-10 text-sm mt-2 justify-center"
            >
              Reservar cita
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
