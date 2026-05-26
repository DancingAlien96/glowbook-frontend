export default function Mockups() {
  return (
    <section id="mockups" className="section relative overflow-hidden">
      <div className="container-tight">
        <div className="max-w-2xl">
          <span className="chip chip-gold">Tu panel administrativo</span>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl text-mauve-900 leading-tight text-balance">
            Toda tu operación, <em className="not-italic text-rose-shimmer">elegante y al instante</em>.
          </h2>
          <p className="mt-5 text-mauve-600 text-lg leading-relaxed">
            Un dashboard premium pensado para dueñas de salones: claridad visual,
            decisiones rápidas y cero ruido.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <DashboardMockup />
          <div className="grid grid-rows-2 gap-6">
            <CalendarMockup />
            <PaymentsMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="relative card-elevated p-0 overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-cream-soft">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blush-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-gold-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-lavender-200" />
        </div>
        <div className="text-[11px] text-mauve-400 font-mono">glowbook.app/dashboard</div>
        <span />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-mauve-400">Bienvenida</div>
            <h3 className="font-serif text-2xl text-mauve-900">Hola, Isabella ✨</h3>
          </div>
          <button className="btn btn-primary h-9 px-4 text-xs">Nueva cita</button>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { label: "Citas hoy", val: "12", delta: "+3", tone: "from-blush-100 to-blush-200" },
            { label: "Ingresos hoy", val: "$486", delta: "+18%", tone: "from-gold-300/40 to-gold-300/60" },
            { label: "Ocupación", val: "78%", delta: "+5%", tone: "from-lavender-100 to-lavender-200" },
            { label: "Nuevas clientas", val: "5", delta: "+2", tone: "from-nude-200 to-nude-300" },
          ].map((k) => (
            <div key={k.label} className={`rounded-2xl p-3.5 bg-gradient-to-br ${k.tone}`}>
              <div className="text-[10px] uppercase tracking-wider text-mauve-600">{k.label}</div>
              <div className="mt-1 font-serif text-xl text-mauve-900">{k.val}</div>
              <div className="text-[10px] text-mauve-600 mt-0.5">{k.delta} vs ayer</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-6 rounded-2xl border border-line p-4 bg-ivory">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-mauve-400">Ingresos · últimos 7 días</div>
              <div className="font-serif text-xl text-mauve-900">$3,240</div>
            </div>
            <div className="flex gap-1">
              {["7D", "30D", "90D"].map((t, i) => (
                <span key={t} className={`text-[10px] px-2 py-1 rounded-full ${i === 0 ? "bg-mauve-900 text-cream" : "bg-mauve-900/5 text-mauve-600"}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 h-28 flex items-end gap-2">
            {[40, 55, 38, 70, 60, 88, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-md bg-gradient-to-t from-blush-200 via-blush-300 to-blush-400 transition-all" style={{ height: `${h}%` }} />
                <span className="text-[9px] text-mauve-400">{["L", "M", "M", "J", "V", "S", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest bookings */}
        <div className="mt-5 rounded-2xl border border-line bg-ivory overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <div className="text-sm font-medium text-mauve-900">Reservas recientes</div>
            <span className="text-[11px] text-mauve-400">Ver todas →</span>
          </div>
          <div className="divide-y divide-line">
            {[
              { name: "Mariana Sosa", svc: "Pestañas pelo a pelo", time: "11:30", st: "Confirmada", c: "status-confirmed" },
              { name: "Lucía Bravo", svc: "Manicure francés", time: "12:45", st: "Pendiente", c: "status-pending" },
              { name: "Bianca Reyes", svc: "Color premium", time: "14:00", st: "Confirmada", c: "status-confirmed" },
            ].map((r) => (
              <div key={r.name} className="px-4 py-2.5 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-lavender-200 to-lavender-400 grid place-items-center text-mauve-900 text-xs font-medium">
                  {r.name.split(" ").map(p => p[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-mauve-900 truncate">{r.name}</div>
                  <div className="text-[11px] text-mauve-400 truncate">{r.svc}</div>
                </div>
                <div className="text-xs text-mauve-600">{r.time}</div>
                <span className={`chip ${r.c} text-[10px]`}>{r.st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarMockup() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-mauve-400">Mayo · 2026</div>
          <div className="font-serif text-lg text-mauve-900">Vista semanal</div>
        </div>
        <div className="flex gap-1.5">
          <button className="h-7 w-7 rounded-full bg-mauve-900/5 grid place-items-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="h-7 w-7 rounded-full bg-mauve-900/5 grid place-items-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] text-mauve-400">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => {
          const day = i - 2;
          const active = day === 14;
          const busy = [6, 8, 12, 17, 19, 22, 24, 27].includes(day);
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg grid place-items-center text-xs relative ${
                active ? "bg-mauve-900 text-cream font-medium" : day > 0 && day <= 31 ? "text-mauve-700 hover:bg-mauve-900/5" : "text-mauve-400/40"
              }`}
            >
              {day > 0 && day <= 31 ? day : ""}
              {busy && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blush-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentsMockup() {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-mauve-400">Pagos por confirmar</div>
          <div className="font-serif text-lg text-mauve-900">Comprobantes</div>
        </div>
        <span className="chip chip-blush">3 nuevos</span>
      </div>

      <div className="mt-4 space-y-2.5">
        {[
          { n: "Daniela V.", a: "$24.00", k: "Transferencia" },
          { n: "Renata M.", a: "$18.00", k: "Yape" },
        ].map((p) => (
          <div key={p.n} className="rounded-2xl border border-line p-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cream-soft to-blush-100 grid place-items-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-mauve-700" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-mauve-900">{p.n}</div>
              <div className="text-[11px] text-mauve-400">{p.k} · {p.a}</div>
            </div>
            <div className="flex gap-1.5">
              <button className="h-8 w-8 rounded-full bg-mauve-900 text-cream grid place-items-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button className="h-8 w-8 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
