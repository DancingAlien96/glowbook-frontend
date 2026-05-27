const steps = [
  {
    num: "01",
    title: "Configura tu salón",
    desc: "Crea servicios, define duración, precios y reglas de anticipo. En 5 minutos estás listo.",
    visual: (
      <div className="space-y-2.5">
        <div className="rounded-xl bg-cream-soft p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-mauve-400">Servicio</div>
            <div className="text-sm font-medium text-mauve-900">Corte + tratamiento capilar</div>
          </div>
          <span className="text-xs font-medium text-gold-600">$45</span>
        </div>
        <div className="rounded-xl bg-cream-soft p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-mauve-400">Servicio</div>
            <div className="text-sm font-medium text-mauve-900">Maquillaje social</div>
          </div>
          <span className="text-xs font-medium text-gold-600">$60</span>
        </div>
        <div className="rounded-xl bg-cream-soft p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-mauve-400">Anticipo</div>
            <div className="text-sm font-medium text-mauve-900">30% requerido</div>
          </div>
          <span className="h-5 w-9 rounded-full bg-mauve-900 relative">
            <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-cream" />
          </span>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    title: "Comparte tu enlace",
    desc: "Tu salón obtiene una página de reservas única, elegante y optimizada para móvil.",
    visual: (
      <div className="space-y-3">
        <div className="rounded-xl bg-mauve-900 p-3 flex items-center gap-2 text-cream/80 text-[11px] font-mono">
          <span className="h-2 w-2 rounded-full bg-gold-400" />
          ecodama.online/<span className="text-cream">tu-salon</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["WhatsApp", "Instagram", "QR"].map((t) => (
            <div key={t} className="rounded-xl border border-line bg-ivory p-3 text-center">
              <div className="text-[11px] text-mauve-400">Compartir</div>
              <div className="text-xs font-medium text-mauve-900 mt-0.5">{t}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: "03",
    title: "Recibe reservas y pagos",
    desc: "Tus clientas eligen servicio, fecha, estilista y pagan el anticipo. Tú recibes todo confirmado.",
    visual: (
      <div className="space-y-2.5">
        {[
          { name: "Camila P.", svc: "Pedicure spa", time: "10:30", color: "status-confirmed" },
          { name: "Antonia R.", svc: "Color + corte", time: "13:00", color: "status-pending" },
          { name: "Sofía L.", svc: "Cejas perfectas", time: "16:00", color: "status-confirmed" },
        ].map((r) => (
          <div key={r.name} className="rounded-xl border border-line bg-ivory p-2.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blush-200 to-blush-400 grid place-items-center text-mauve-900 font-serif text-sm">
              {r.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-mauve-900 truncate">{r.name}</div>
              <div className="text-[11px] text-mauve-400 truncate">{r.svc} · {r.time}</div>
            </div>
            <span className={`chip ${r.color} text-[10px]`}>{r.color.replace("status-", "")}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section relative overflow-hidden">
      <div className="absolute inset-0 bg-aurora-soft -z-10" />

      <div className="container-tight">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip chip-lavender">Cómo funciona</span>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-mauve-900 leading-tight text-balance">
            Tres pasos para transformar tu agenda.
          </h2>
          <p className="mt-5 text-mauve-600 text-lg leading-relaxed">
            Sin instalaciones, sin contratos largos, sin curva de aprendizaje. Listo en una tarde.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-7 left-[16%] right-[16%] divider-gold" />

          {steps.map((s) => (
            <div key={s.num} className="relative card-elevated p-7">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-mauve-800 to-mauve-900 grid place-items-center text-cream font-serif text-lg shadow-lg">
                  {s.num}
                </div>
                <div className="h-px flex-1 bg-line" />
              </div>
              <h3 className="mt-5 font-serif text-2xl text-mauve-900">{s.title}</h3>
              <p className="mt-2 text-mauve-600 text-[0.95rem] leading-relaxed">{s.desc}</p>
              <div className="mt-6 rounded-2xl border border-line bg-cream/40 p-3.5">
                {s.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
