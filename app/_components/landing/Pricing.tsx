import Link from "next/link";
import { SUPPORT_MESSAGES, whatsappHref } from "../../_lib/support";

const plans = [
  {
    id: "monthly",
    label: "Mensual",
    name: "Plan Glow",
    desc: "Para empezar sin compromisos largos.",
    price: 20,
    period: "USD / mes",
    subtext: "14 días gratis · sin tarjeta · cancela cuando quieras.",
    badge: "Flexibilidad total",
    cta: "Empezar gratis — 14 días",
    href: "/register",
    highlighted: false,
    saving: null,
  },
  {
    id: "yearly",
    label: "Anual",
    name: "Plan Radiance",
    desc: "Compromiso anual con el mejor ahorro.",
    price: 200,
    period: "USD / año",
    subtext: "≈ $16.67/mes • Se renueva automáticamente",
    badge: "Ahorra 17%",
    cta: "Activar plan anual",
    href: "https://app.recurrente.com/s/arcadiasolutions/suscripcion-anual-ecodama",
    highlighted: true,
    saving: "17%",
  },
  {
    id: "lifetime",
    label: "Lifetime",
    name: "Plan Infinity",
    desc: "Un solo pago, acceso de por vida.",
    price: 1000,
    period: "USD una vez",
    subtext: "≈ 5 años del plan mensual.",
    badge: "Mejor inversión",
    cta: "Acceso de por vida",
    href: "https://app.recurrente.com/s/arcadiasolutions/plan-lifetime-ecodama",
    highlighted: false,
    saving: "60%",
  },
];

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

        <div className="mt-14 grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative ${plan.highlighted ? "lg:scale-105 origin-center" : ""}`}
            >
              {/* Highlight glow for recommended plan */}
              {plan.highlighted && (
                <div className="absolute -inset-1 bg-gradient-to-br from-gold-300 via-blush-300 to-lavender-200 rounded-[1.6rem] blur-md opacity-70" />
              )}

              <div
                className={`relative ${
                  plan.highlighted
                    ? "card-elevated p-8 border-gold-400/30 bg-gradient-to-br from-ivory via-cream to-cream-soft overflow-hidden isolate"
                    : "card-elevated p-8 relative"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-300/30 blur-2xl" />
                )}

                <div className="flex items-center justify-between">
                  <span className={`chip ${plan.highlighted ? "chip-gold inline-flex" : "chip-cream"}`}>
                    {plan.highlighted && <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mr-1.5" />}
                    {plan.badge}
                  </span>
                  {plan.saving && (
                    <span className={`text-xs font-medium ${plan.highlighted ? "text-gold-600" : "text-mauve-400"}`}>
                      Ahorra +{plan.saving}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-serif text-2xl text-mauve-900">{plan.name}</h3>
                <p className="mt-1 text-mauve-600 text-sm">{plan.desc}</p>

                <div className="mt-7 flex items-baseline gap-2">
                  <span className={`font-serif text-6xl ${plan.highlighted ? "text-gold-shimmer" : "text-mauve-900"}`}>
                    ${plan.price}
                  </span>
                  <span className="text-mauve-400 text-sm">{plan.period}</span>
                </div>
                <div className="text-xs text-mauve-400 mt-1">{plan.subtext}</div>

                {plan.id === "monthly" ? (
                  <Link href={plan.href} className="btn btn-outline w-full h-12 mt-7">
                    {plan.cta}
                  </Link>
                ) : (
                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`btn w-full h-12 mt-7 ${plan.highlighted ? "btn-gold" : "btn-outline"}`}
                  >
                    {plan.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                )}

                <ul className="mt-7 space-y-3">
                  {(plan.id === "lifetime"
                    ? [...features, "Actualizaciones gratuitas para siempre"]
                    : features
                  ).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-mauve-700">
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlighted ? "text-gold-600" : "text-mauve-900"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-mauve-400">
          Pago seguro con tarjeta de débito o crédito ·{" "}
          <a
            href={whatsappHref(SUPPORT_MESSAGES.demo)}
            target="_blank"
            rel="noreferrer"
            className="text-mauve-700 underline-offset-2 hover:underline"
          >
            Solicitar demo gratuita
          </a>{" "}
          · Garantía 30 días
        </p>
      </div>
    </section>
  );
}
