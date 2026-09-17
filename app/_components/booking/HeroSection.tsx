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
    <section id="inicio" className="relative min-h-[92vh] md:min-h-screen flex flex-col items-center justify-center pt-16 pb-8 md:pt-0 md:pb-0 overflow-hidden scroll-mt-16">
      <div className="absolute inset-0">
        {salon.coverImageUrl ? (
          <>
            {/* On phones this is only a blurred filler behind the real photo
                below — the hero box is portrait there, so object-cover was
                throwing away more than half the width of a landscape cover.
                From md up the blur lifts and this IS the cover, unchanged. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={salon.coverImageUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover scale-110 blur-2xl md:scale-100 md:blur-none"
            />
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
        className="absolute top-20 right-4 sm:top-24 sm:right-6 z-10 h-10 px-3 sm:px-4 rounded-full bg-cream/15 backdrop-blur-md text-cream text-xs font-medium hidden md:inline-flex items-center gap-1.5 hover:bg-cream/25 transition border border-cream/20"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
        Compartir
      </button>

      {/* Phone-only: the cover at full width, object-contain so the whole
          photo survives whatever aspect ratio the salon uploaded. Hidden from
          md up, where the background image above already shows it in full. */}
      {salon.coverImageUrl && (
        <div className="relative z-[1] w-full mb-5 md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={salon.coverImageUrl}
            alt={salon.name}
            className="w-full aspect-[3/2] object-contain"
          />
        </div>
      )}

      <div className="relative z-[1] text-center px-4 max-w-3xl mx-auto">
        <div className="mb-4 md:mb-6 flex justify-center">
          <div className="h-12 w-12 md:h-20 md:w-20 rounded-full border-2 border-cream/50 backdrop-blur-sm bg-cream/10 grid place-items-center text-cream font-serif text-lg md:text-3xl">
            {initials(salon.name)}
          </div>
        </div>

        <p className="text-cream/80 text-[10px] md:text-sm font-medium tracking-[0.2em] uppercase mb-2 md:mb-4">
          Reservar en {salon.name}
        </p>

        <h1 className="font-serif text-3xl md:text-6xl lg:text-7xl text-cream font-semibold mb-2 md:mb-4 leading-[1.1] text-balance break-words">
          {salon.name}
        </h1>

        {salon.tagline && (
          <p className="font-serif text-base md:text-2xl text-cream/90 italic mb-2 md:mb-3 text-pretty">{salon.tagline}</p>
        )}
        {salon.address && (
          <p className="text-cream/70 text-[10px] md:text-sm tracking-wide uppercase mb-3 md:mb-8">{salon.address}</p>
        )}
        {salon.description && (
          <p className="text-cream/85 text-xs md:text-base mb-5 md:mb-8 max-w-xl mx-auto text-pretty">{salon.description}</p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-2">
          <a
            href="#reservar"
            className="btn h-11 md:h-12 px-6 md:px-8 text-sm md:text-base rounded-full"
            style={{ backgroundColor: "var(--brand)", color: "#fff" }}
          >
            Reservar cita
          </a>
          {secondCta && (
            <a
              href={secondCta.href}
              className="h-11 md:h-12 px-6 md:px-8 inline-flex items-center justify-center rounded-full border border-cream/50 text-cream text-sm md:text-base font-medium hover:bg-cream/10 transition"
            >
              {secondCta.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
