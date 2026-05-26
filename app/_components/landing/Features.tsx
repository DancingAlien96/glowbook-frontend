const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <circle cx="12" cy="15" r="2" />
      </svg>
    ),
    title: "Calendario inteligente",
    desc: "Gestiona citas, bloqueos y disponibilidad con una vista limpia, intuitiva y siempre en sincronía.",
    accent: "from-blush-200 to-blush-300",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.5-9-9.5C1.5 7 4.5 4 8 4c2 0 3.2 1 4 2.2C12.8 5 14 4 16 4c3.5 0 6.5 3 5 7.5-2 5-9 9.5-9 9.5z" />
      </svg>
    ),
    title: "Experiencia premium",
    desc: "Cada interacción —desde reservar hasta pagar— se siente refinada, rápida y digna de una marca de lujo.",
    accent: "from-lavender-100 to-lavender-200",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    ),
    title: "Pagos anticipados",
    desc: "Cobra el anticipo o pago completo antes de la cita. Acepta transferencias, tarjetas y comprobantes.",
    accent: "from-gold-300 to-gold-400",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    title: "Ficha de clientas",
    desc: "Historial, preferencias, notas y servicios anteriores en una ficha elegante que tu equipo puede consultar.",
    accent: "from-nude-200 to-nude-300",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11c0 5-9 11-9 11s-9-6-9-11a9 9 0 0118 0z" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    ),
    title: "Reservas móviles",
    desc: "Tus clientas reservan desde el celular en segundos: eligen servicio, estilista, fecha y pagan.",
    accent: "from-blush-300 to-blush-400",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5M4 19h16M8 16V9M12 16V6M16 16v-5M20 16v-8" />
      </svg>
    ),
    title: "Métricas en vivo",
    desc: "Ingresos, ocupación, retención y servicios estrella. Decide con datos, no con intuición.",
    accent: "from-lavender-200 to-lavender-400",
  },
];

export default function Features() {
  return (
    <section id="features" className="section relative">
      <div className="container-tight">
        <div className="max-w-2xl">
          <span className="chip chip-blush">Todo lo que tu salón necesita</span>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-mauve-900 leading-tight text-balance">
            Diseñado con el detalle de una <em className="not-italic text-gold-shimmer">marca de lujo</em>.
          </h2>
          <p className="mt-5 text-mauve-600 text-lg leading-relaxed">
            Más que un sistema de reservas: una plataforma completa pensada para
            elevar la experiencia de tus clientas y simplificar tu día a día.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group relative card-surface p-7 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${f.accent} grid place-items-center text-mauve-900 shadow-sm`}>
                {f.icon}
              </div>
              <h3 className="mt-5 font-serif text-2xl text-mauve-900">{f.title}</h3>
              <p className="mt-2.5 text-mauve-600 leading-relaxed text-[0.95rem]">{f.desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs text-mauve-400 group-hover:text-mauve-900 transition-colors">
                <span>Conocer más</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
