import { initials } from "../../_lib/format";
import type { PublicSalon } from "../../_lib/publicSalon";

// Full-bleed hero — deliberately breaks out of container-tight so the cover
// image (or, lacking one, a brand-tinted gradient) fills the viewport edge
// to edge instead of sitting in a boxed card. PublicNavbar renders on top
// of this (transparent until scrolled), so this section owns the very top
// of the page.
export default function HeroSection({
  salon,
  onShare,
}: {
  salon: PublicSalon;
  onShare: () => void;
}) {
  const hasServices = salon.services.length > 0;
  const hasGallery = salon.photos.length > 0;
  const secondCta = hasServices
    ? { href: "#servicios", label: "Ver servicios" }
    : hasGallery
    ? { href: "#galeria", label: "Ver galería" }
    : null;

  return (
    <section id="inicio" className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden scroll-mt-16">
      <div className="absolute inset-0">
        {salon.coverImageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={salon.coverImageUrl} alt={salon.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-mauve-900/55 via-mauve-900/35 to-mauve-900/70" />
          </>
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--brand) 55%, transparent), transparent 55%), radial-gradient(circle at 85% 85%, color-mix(in srgb, var(--brand) 35%, transparent), transparent 55%), linear-gradient(160deg, #2a1620 0%, #3a1f2c 55%, #241019 100%)`,
            }}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onShare}
        aria-label="Compartir este salón"
        className="absolute top-20 right-4 sm:top-24 sm:right-6 z-10 h-10 px-3 sm:px-4 rounded-full bg-cream/15 backdrop-blur-md text-cream text-xs font-medium inline-flex items-center gap-1.5 hover:bg-cream/25 transition border border-cream/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
        Compartir
      </button>

      <div className="relative z-[1] text-center px-4 max-w-3xl mx-auto">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-cream/50 backdrop-blur-sm bg-cream/10 grid place-items-center text-cream font-serif text-2xl md:text-3xl">
            {initials(salon.name)}
          </div>
        </div>

        <p className="text-cream/80 text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-4">
          Reservar en {salon.name}
        </p>

        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-cream font-semibold mb-4 leading-[1.1] text-balance break-words">
          {salon.name}
        </h1>

        {salon.tagline && (
          <p className="font-serif text-lg md:text-2xl text-cream/90 italic mb-3 text-pretty">{salon.tagline}</p>
        )}
        {salon.address && (
          <p className="text-cream/70 text-xs md:text-sm tracking-wide uppercase mb-8">{salon.address}</p>
        )}
        {salon.description && (
          <p className="text-cream/85 text-sm md:text-base mb-8 max-w-xl mx-auto text-pretty">{salon.description}</p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-2">
          <a
            href="#reservar"
            className="btn h-12 px-8 text-sm md:text-base rounded-full"
            style={{ backgroundColor: "var(--brand)", color: "#fff" }}
          >
            Reservar cita
          </a>
          {secondCta && (
            <a
              href={secondCta.href}
              className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-cream/50 text-cream text-sm md:text-base font-medium hover:bg-cream/10 transition"
            >
              {secondCta.label}
            </a>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-cream/60 animate-bounce">
        <span className="text-[10px] uppercase tracking-wider">Desplazar</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </div>
    </section>
  );
}
