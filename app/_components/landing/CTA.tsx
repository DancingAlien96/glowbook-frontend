import Link from "next/link";
import { SUPPORT_MESSAGES, whatsappHref } from "../../_lib/support";

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
              <a
                href={whatsappHref(SUPPORT_MESSAGES.signup)}
                target="_blank"
                rel="noreferrer"
                className="btn h-12 px-6 bg-cream/10 text-cream border border-cream/15 hover:bg-cream/15"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
                Hablar con soporte
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-cream/60">
              <span>✦ Activación por transferencia</span>
              <a
                href={whatsappHref(SUPPORT_MESSAGES.general)}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-2 hover:text-cream hover:underline transition"
              >
                ✦ Soporte personalizado
              </a>
              <span>✦ Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
