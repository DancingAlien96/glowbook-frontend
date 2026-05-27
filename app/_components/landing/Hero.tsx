import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-aurora -z-10" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent -z-10" />

      {/* Floating decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-blush-200/60 blur-3xl anim-drift" />
      <div className="pointer-events-none absolute top-32 -right-20 h-80 w-80 rounded-full bg-lavender-100/70 blur-3xl anim-drift" style={{ animationDelay: "-3s" }} />

      <div className="container-tight relative">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="anim-fade-up">
            <span className="chip chip-gold inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              Nueva era para tu salón
            </span>

            <h1 className="mt-6 font-serif text-[2.6rem] sm:text-[3.4rem] lg:text-[4.2rem] leading-[1.02] tracking-tight text-mauve-900 text-balance">
              La agenda <em className="not-italic text-gold-shimmer">premium</em>
              <br className="hidden sm:block" /> para tu salón de belleza.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-mauve-600 leading-relaxed text-pretty">
              Ecodama es el sistema de citas elegante, intuitivo y refinado para
              salones, spas y profesionales del cuidado personal. Reservas sin
              fricción, pagos anticipados y una experiencia que tus clientas
              recordarán.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn btn-primary h-12 px-6">
                Crear mi salón
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <Link href="#mockups" className="btn btn-ghost h-12 px-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                Ver demo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-mauve-600">
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {["from-blush-300 to-blush-400", "from-lavender-200 to-lavender-400", "from-nude-200 to-nude-300", "from-gold-300 to-gold-500"].map((c, i) => (
                    <span key={i} className={`h-7 w-7 rounded-full bg-gradient-to-br ${c} ring-2 ring-cream`} />
                  ))}
                </div>
                <span><strong className="text-mauve-900">+2,400</strong> salones confían en Ecodama</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-gold-500"><path d="M10 1.5l2.6 5.4 5.9.6-4.4 4.1 1.3 5.8L10 14.6l-5.4 2.8 1.3-5.8L1.5 7.5l5.9-.6L10 1.5z"/></svg>
                ))}
                <span className="ml-1">4.9 · 800+ reseñas</span>
              </div>
            </div>
          </div>

          {/* Right: hero photo with floating booking card */}
          <div className="relative anim-fade-up delay-200">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* Soft glow behind the photo */}
      <div className="absolute -inset-6 bg-gradient-to-tr from-blush-200/70 via-cream to-lavender-100/70 blur-2xl rounded-[3rem]" />

      {/* Photo frame */}
      <div className="relative rounded-[2rem] overflow-hidden ring-1 ring-white/60 shadow-[var(--shadow-elevated)]">
        <Image
          src="/hero.png"
          alt="Profesional de la belleza en su salón"
          width={1200}
          height={800}
          priority
          className="w-full h-auto object-cover"
        />
        {/* subtle warm overlay to blend with the palette */}
        <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/10 via-transparent to-transparent" />
      </div>

      {/* Floating glass card: next appointment */}
      <div className="absolute -left-4 sm:-left-8 bottom-6 w-60 glass rounded-2xl p-3.5 anim-float">
        <div className="flex items-start justify-between">
          <span className="chip chip-blush text-[10px]">Próxima cita</span>
          <span className="chip status-confirmed text-[10px]">Confirmada</span>
        </div>
        <div className="mt-2 font-serif text-base text-mauve-900 leading-snug">
          Manicure rusa + nail art
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream text-[11px] font-serif">V</span>
          <div className="text-[11px] text-mauve-600 leading-tight">
            Valentina · Vie 29 May<br />3:30 PM · 90 min
          </div>
        </div>
      </div>

      {/* Floating mini card: payment received */}
      <div className="absolute -right-3 sm:-right-6 top-6 w-52 glass rounded-2xl p-3 anim-float hidden sm:block" style={{ animationDelay: "-2s" }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 grid place-items-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#21161B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="absolute inset-0 rounded-full anim-pulse-ring" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-mauve-400">Anticipo recibido</div>
            <div className="text-sm font-medium text-mauve-900">$18.00 · Catalina M.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
