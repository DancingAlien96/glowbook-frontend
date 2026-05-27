import Link from "next/link";

const features = [
  "Calendario y reservas ilimitadas",
  "Página de reservas personalizada",
  "Anticipos configurables (% o total)",
  "Recordatorios automáticos por email",
  "Panel de clientas e historial",
  "Métricas e ingresos en vivo",
  "Soporte premium 7 días a la semana",
];

export default function Pricing() {
  return (
    <section id="pricing" className="section relative">
      <div className="container-tight">
        <div className="max-w-2xl mx-auto text-center">
          <span className="chip chip-gold">Planes simples</span>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-mauve-900 leading-tight text-balance">
            Una inversión que paga sola la primera semana.
          </h2>
          <p className="mt-5 text-mauve-600 text-lg leading-relaxed">
            Elige cómo prefieres pagar. Sin compromisos, sin sorpresas, sin costos ocultos.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Monthly */}
          <div className="card-elevated p-8 relative">
            <div className="flex items-center justify-between">
              <span className="chip chip-cream">Mensual</span>
              <span className="text-xs text-mauve-400">Flexibilidad total</span>
            </div>
            <h3 className="mt-5 font-serif text-2xl text-mauve-900">Plan Glow</h3>
            <p className="mt-1 text-mauve-600 text-sm">Para empezar sin compromisos largos.</p>

            <div className="mt-7 flex items-baseline gap-2">
              <span className="font-serif text-6xl text-mauve-900">$20</span>
              <span className="text-mauve-400 text-sm">USD / mes</span>
            </div>
            <div className="text-xs text-mauve-400 mt-1">Cancela cuando quieras.</div>

            <Link href="/register" className="btn btn-outline w-full h-12 mt-7">
              Crear mi salón
            </Link>

            <ul className="mt-7 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-mauve-700">
                  <svg className="mt-0.5 h-4 w-4 text-mauve-900 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Lifetime — RECOMMENDED */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-gold-300 via-blush-300 to-lavender-200 rounded-[1.6rem] blur-md opacity-70" />
            <div className="relative card-elevated p-8 border-gold-400/30 bg-gradient-to-br from-ivory via-cream to-cream-soft overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-300/30 blur-3xl" />

              <div className="flex items-center justify-between">
                <span className="chip chip-gold inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  Recomendado
                </span>
                <span className="text-xs text-gold-600 font-medium">Ahorra +60%</span>
              </div>
              <h3 className="mt-5 font-serif text-2xl text-mauve-900">Plan Lifetime</h3>
              <p className="mt-1 text-mauve-600 text-sm">Un solo pago, acceso de por vida.</p>

              <div className="mt-7 flex items-baseline gap-2">
                <span className="font-serif text-6xl text-gold-shimmer">$660</span>
                <span className="text-mauve-400 text-sm">USD una vez</span>
              </div>
              <div className="text-xs text-mauve-400 mt-1">≈ 2.75 años del plan mensual.</div>

              <Link href="/register" className="btn btn-gold w-full h-12 mt-7">
                Quiero acceso de por vida
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Link>

              <ul className="mt-7 space-y-3">
                {[...features, "Actualizaciones gratuitas para siempre", "Acceso anticipado a nuevas funciones"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-mauve-700">
                    <svg className="mt-0.5 h-4 w-4 text-gold-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-mauve-400">
          Activación por transferencia bancaria · Coordinamos contigo personalmente · Garantía 30 días
        </p>
      </div>
    </section>
  );
}
