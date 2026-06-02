"use client";

// Hand-rolled SVG charts for the dashboard analytics grid. No chart library
// — they're all small static visualisations sized in viewBox space so they
// scale fluidly to whatever card they sit in. Themed on the Ecodama palette
// (mauve / blush / gold / lavender).

import { money } from "../../_lib/format";

// ─── Shared helpers ─────────────────────────────────────────────────────

const PALETTE = {
  mauve: "#1F0F15",
  mauveMid: "#503842",
  blush: "#E59078",
  blushDeep: "#CE6850",
  gold: "#CB923D",
  goldLight: "#DDB677",
  lavender: "#C2ABDE",
  lavenderDeep: "#7951A4",
  sage: "#84B88E",
  cream: "#FBF8F3",
  line: "rgba(31, 15, 21, 0.10)",
};

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: PALETTE.sage,
  COMPLETED: PALETTE.lavenderDeep,
  PENDING: PALETTE.gold,
  CANCELLED: PALETTE.blushDeep,
  NO_SHOW: PALETTE.mauveMid,
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Confirmadas",
  COMPLETED: "Completadas",
  PENDING: "Pendientes",
  CANCELLED: "Canceladas",
  NO_SHOW: "No asistió",
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-5 sm:p-6 min-w-0 overflow-hidden">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-mauve-900 leading-tight">{title}</h3>
        {subtitle && <span className="text-[10px] uppercase tracking-wider text-mauve-400 shrink-0">{subtitle}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmptyChart({ msg }: { msg: string }) {
  return (
    <div className="h-32 grid place-items-center text-xs text-mauve-400 text-center px-4">
      {msg}
    </div>
  );
}

// ─── 1. Ingresos · últimos 6 meses (área con gradiente) ─────────────────

export function MonthlyRevenueChart({
  data,
  currency,
}: {
  data: { month: string; cents: number }[];
  currency: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.cents));
  const total = data.reduce((a, d) => a + d.cents, 0);
  const w = 320;
  const h = 120;
  const pad = { l: 6, r: 6, t: 8, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: pad.l + i * stepX,
    y: pad.t + innerH - (d.cents / max) * innerH,
  }));

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${path} L ${points[points.length - 1]!.x} ${pad.t + innerH} L ${points[0]!.x} ${pad.t + innerH} Z`;

  const monthShort = (m: string) => {
    const [, mm] = m.split("-").map(Number) as [number, number];
    return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][mm - 1] ?? "";
  };

  return (
    <ChartCard title="Ingresos · 6 meses" subtitle={money(total, currency)}>
      {total === 0 ? (
        <EmptyChart msg="Sin pagos aprobados en este periodo." />
      ) : (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETTE.blush} stopOpacity="0.45" />
              <stop offset="100%" stopColor={PALETTE.blush} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#revGrad)" />
          <path d={path} fill="none" stroke={PALETTE.blushDeep} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3} fill={PALETTE.cream} stroke={PALETTE.blushDeep} strokeWidth="1.6">
              <title>{`${monthShort(data[i]!.month)} · ${money(data[i]!.cents, currency)}`}</title>
            </circle>
          ))}
          {data.map((d, i) => (
            <text key={d.month} x={pad.l + i * stepX} y={h - 6} textAnchor="middle" fontSize="9" fill={PALETTE.mauveMid} className="font-sans">
              {monthShort(d.month)}
            </text>
          ))}
        </svg>
      )}
    </ChartCard>
  );
}

// ─── 2. Ingresos por estilista (este mes) — barras horizontales ─────────

export function StylistRevenueChart({
  data,
  currency,
}: {
  data: { name: string; cents: number }[];
  currency: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.cents));
  const TONES = [PALETTE.blush, PALETTE.lavenderDeep, PALETTE.gold, PALETTE.sage, PALETTE.mauveMid];
  const showing = data.slice(0, 6);

  return (
    <ChartCard title="Ingresos por estilista" subtitle="Este mes">
      {showing.length === 0 ? (
        <EmptyChart msg="Sin citas completadas este mes." />
      ) : (
        <ul className="space-y-2.5">
          {showing.map((d, i) => {
            const pct = (d.cents / max) * 100;
            return (
              <li key={d.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mauve-700 truncate font-medium">{d.name}</span>
                  <span className="text-mauve-600 tabular-nums font-mono ml-2">{money(d.cents, currency)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-mauve-900/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: TONES[i % TONES.length] }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}

// ─── 3. Top servicios (este mes) — barras horizontales con count ────────

export function TopServicesChart({
  data,
  currency,
}: {
  data: { name: string; count: number; cents: number }[];
  currency: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <ChartCard title="Top servicios" subtitle="Este mes">
      {data.length === 0 ? (
        <EmptyChart msg="Sin servicios completados este mes." />
      ) : (
        <ul className="space-y-2.5">
          {data.map((d, i) => {
            const pct = (d.count / max) * 100;
            return (
              <li key={d.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-mauve-700 truncate font-medium flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-mauve-900/5 grid place-items-center text-[10px] tabular-nums shrink-0">
                      {i + 1}
                    </span>
                    {d.name}
                  </span>
                  <span className="text-mauve-600 tabular-nums font-mono ml-2 whitespace-nowrap">
                    {d.count}× · {money(d.cents, currency)}
                  </span>
                </div>
                <div className="mt-1 ml-7 h-2 rounded-full bg-mauve-900/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}

// ─── 4. Distribución de estados (donut) — últimos 30 días ───────────────

export function StatusDonutChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const total = data.reduce((a, d) => a + d.count, 0);
  const radius = 38;
  const stroke = 16;
  const circumference = 2 * Math.PI * radius;

  // Order for visual stability so the colours don't reshuffle between fetches.
  const order = ["CONFIRMED", "COMPLETED", "PENDING", "CANCELLED", "NO_SHOW"];
  const sorted = [...data].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  let offsetSoFar = 0;

  return (
    <ChartCard title="Estados de citas" subtitle="30 días">
      {total === 0 ? (
        <EmptyChart msg="Sin citas registradas en los últimos 30 días." />
      ) : (
        <div className="flex items-center gap-4">
          {/* Group rotation instead of rotating the whole SVG so the text
              inside stays upright. Donut segments are rotated -90° around
              the centre so the slices start at 12 o'clock. */}
          <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0">
            <g transform="rotate(-90 50 50)">
              <circle cx="50" cy="50" r={radius} fill="none" stroke={PALETTE.line} strokeWidth={stroke} />
              {sorted.map((d) => {
                const len = (d.count / total) * circumference;
                const dashArray = `${len} ${circumference - len}`;
                const segment = (
                  <circle
                    key={d.status}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={STATUS_COLOR[d.status] ?? PALETTE.mauveMid}
                    strokeWidth={stroke}
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offsetSoFar}
                    strokeLinecap="butt"
                  >
                    <title>{`${STATUS_LABEL[d.status] ?? d.status}: ${d.count}`}</title>
                  </circle>
                );
                offsetSoFar += len;
                return segment;
              })}
            </g>
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="500" fill={PALETTE.mauve}>
              {total}
            </text>
            <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" fontSize="6" fill={PALETTE.mauveMid} letterSpacing="0.5">
              CITAS
            </text>
          </svg>
          <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
            {sorted.map((d) => {
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <li key={d.status} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: STATUS_COLOR[d.status] ?? PALETTE.mauveMid }}
                  />
                  <span className="text-mauve-700 truncate flex-1">{STATUS_LABEL[d.status] ?? d.status}</span>
                  <span className="text-mauve-500 tabular-nums">{d.count}</span>
                  <span className="text-mauve-400 tabular-nums w-9 text-right">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}

// ─── 5. Ocupación por día de la semana ─────────────────────────────────

export function WeekdayChart({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const total = data.reduce((a, n) => a + n, 0);

  return (
    <ChartCard title="Día más fuerte" subtitle="30 días">
      {total === 0 ? (
        <EmptyChart msg="Sin citas en los últimos 30 días." />
      ) : (
        <div className="flex items-end gap-2 h-32 mt-2">
          {data.map((v, i) => {
            const pct = (v / max) * 100;
            const isPeak = v === max;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-[10px] font-medium text-mauve-700 tabular-nums">{v}</div>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-md min-h-[2px] transition-all"
                    style={{
                      height: `${pct}%`,
                      background: isPeak
                        ? `linear-gradient(to top, ${PALETTE.lavenderDeep}, ${PALETTE.lavender})`
                        : `linear-gradient(to top, ${PALETTE.lavender}, ${PALETTE.lavender})`,
                      opacity: isPeak ? 1 : 0.55,
                    }}
                    title={`${v} citas`}
                  />
                </div>
                <span className="text-[10px] text-mauve-400 font-medium">{WEEKDAYS[i]}</span>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}

// ─── 6. Clientas nuevas vs recurrentes (este mes) ───────────────────────

export function ClientMixChart({
  data,
}: {
  data: { newCount: number; returningCount: number };
}) {
  const total = data.newCount + data.returningCount;
  const newPct = total > 0 ? (data.newCount / total) * 100 : 0;
  const retPct = total > 0 ? (data.returningCount / total) * 100 : 0;

  return (
    <ChartCard title="Clientas del mes" subtitle="Nuevas vs recurrentes">
      {total === 0 ? (
        <EmptyChart msg="Sin clientas atendidas este mes." />
      ) : (
        <div>
          <div className="flex h-9 rounded-xl overflow-hidden">
            <div
              className="grid place-items-center text-xs font-medium text-cream tabular-nums"
              style={{ width: `${newPct}%`, background: `linear-gradient(135deg, ${PALETTE.gold}, ${PALETTE.goldLight})` }}
              title={`Nuevas: ${data.newCount}`}
            >
              {newPct >= 14 && `${Math.round(newPct)}%`}
            </div>
            <div
              className="grid place-items-center text-xs font-medium text-cream tabular-nums"
              style={{ width: `${retPct}%`, background: `linear-gradient(135deg, ${PALETTE.mauveMid}, ${PALETTE.mauve})` }}
              title={`Recurrentes: ${data.returningCount}`}
            >
              {retPct >= 14 && `${Math.round(retPct)}%`}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: PALETTE.gold }} />
              <span className="text-mauve-700 truncate flex-1">Nuevas</span>
              <span className="text-mauve-900 font-medium tabular-nums">{data.newCount}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: PALETTE.mauveMid }} />
              <span className="text-mauve-700 truncate flex-1">Recurrentes</span>
              <span className="text-mauve-900 font-medium tabular-nums">{data.returningCount}</span>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
