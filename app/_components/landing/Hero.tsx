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
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
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
              Glowbook es el sistema de citas elegante, intuitivo y refinado para
              salones, spas y profesionales del cuidado personal. Reservas sin
              fricción, pagos anticipados y una experiencia que tus clientas
              recordarán.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="btn btn-primary h-12 px-6">
                Comenzar gratis 14 días
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
                <span><strong className="text-mauve-900">+2,400</strong> salones confían en Glowbook</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-gold-500"><path d="M10 1.5l2.6 5.4 5.9.6-4.4 4.1 1.3 5.8L10 14.6l-5.4 2.8 1.3-5.8L1.5 7.5l5.9-.6L10 1.5z"/></svg>
                ))}
                <span className="ml-1">4.9 · 800+ reseñas</span>
              </div>
            </div>
          </div>

          {/* Right: layered product mock */}
          <div className="relative anim-fade-up delay-200">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-md lg:max-w-none">
      {/* Glow underlay */}
      <div className="absolute -inset-8 bg-gradient-to-tr from-blush-200/60 via-cream to-lavender-100/60 blur-2xl rounded-[3rem]" />

      {/* Main card: booking confirmation */}
      <div className="relative card-elevated p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <div>
            <span className="chip chip-blush">Próxima cita</span>
            <h3 className="mt-3 font-serif text-2xl text-mauve-900 leading-snug">
              Manicure rusa <br/> + diseño nail art
            </h3>
          </div>
          <span className="chip status-confirmed">Confirmada</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-cream-soft p-3">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Fecha</div>
            <div className="mt-1 font-medium text-mauve-900">Vie 29 May</div>
          </div>
          <div className="rounded-xl bg-cream-soft p-3">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Hora</div>
            <div className="mt-1 font-medium text-mauve-900">3:30 PM</div>
          </div>
          <div className="rounded-xl bg-cream-soft p-3">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Duración</div>
            <div className="mt-1 font-medium text-mauve-900">90 min</div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-line p-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif">V</div>
            <div>
              <div className="text-sm font-medium text-mauve-900">Valentina Rojas</div>
              <div className="text-xs text-mauve-400">Estilista · Nail artist senior</div>
            </div>
          </div>
          <button className="text-xs text-mauve-600 underline-offset-4 hover:underline">Cambiar</button>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-mauve-400">Anticipo (30%)</div>
            <div className="font-serif text-2xl text-mauve-900">$18.<span className="text-mauve-400 text-lg">00</span></div>
          </div>
          <button className="btn btn-gold h-11 px-5 text-sm">
            Pagar anticipo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* Floating mini card: payment received */}
      <div className="absolute -left-8 -bottom-10 w-64 card-surface p-3.5 anim-float hidden sm:block">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 grid place-items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#21161B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="absolute inset-0 rounded-full anim-pulse-ring" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Pago recibido</div>
            <div className="text-sm font-medium text-mauve-900">$18.00 · Catalina M.</div>
          </div>
        </div>
      </div>

      {/* Floating mini card: today metric */}
      <div className="absolute -right-6 -top-8 w-56 card-surface p-3.5 anim-float hidden sm:block" style={{ animationDelay: "-2s" }}>
        <div className="text-[11px] uppercase tracking-wider text-mauve-400">Hoy</div>
        <div className="mt-1 flex items-end gap-2">
          <div className="font-serif text-2xl text-mauve-900">12</div>
          <div className="text-xs text-mauve-600 mb-1">citas confirmadas</div>
        </div>
        <div className="mt-3 flex items-end gap-1 h-8">
          {[4, 7, 5, 9, 6, 10, 12, 8].map((h, i) => (
            <span key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blush-200 to-blush-400" style={{ height: `${h * 8}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
