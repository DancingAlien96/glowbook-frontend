import Link from "next/link";

export default function CTA() {
  return (
    <section className="section">
      <div className="container-tight">
        <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-16 bg-gradient-to-br from-mauve-900 via-mauve-800 to-mauve-900 text-cream isolate">
          {/* Decorative glow — blur-2xl avoids GPU tearing on older Android tablets */}
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blush-400/30 blur-2xl" />
          <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-gold-400/25 blur-2xl" />
          <div className="absolute inset-0 pattern-dots opacity-30" />

          <div className="relative max-w-2xl">
            <span className="chip chip-gold inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Listo para elevar tu salón
            </span>
            <h2 className="mt-5 font-serif text-4xl sm:text-5xl leading-tight text-balance">
              Empieza hoy. <em className="not-italic text-gold-shimmer">Brilla mañana.</em>
            </h2>
            <p className="mt-5 text-cream/70 text-lg leading-relaxed">
              Únete a las +2,400 dueñas de salones que ya eligieron Ecodama para
              ofrecer una experiencia premium a sus clientas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-gold h-12 px-6">
                Crear mi salón
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/book/maison-rose" className="btn h-12 px-6 bg-cream/10 text-cream border border-cream/15 hover:bg-cream/15">
                Ver una página de reservas
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-cream/60">
              <span>✦ Activación por transferencia</span>
              <span>✦ Soporte personalizado</span>
              <span>✦ Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
