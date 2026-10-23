"use client";

// Reportes — any previous month (or a whole year) at a glance, with a
// "Descargar PDF" button. The page itself is the printable document: under
// @media print the app chrome and the filter bar disappear and a report
// header (salon + period + generated-at) shows instead — see globals.css.
// Using the browser's print-to-PDF keeps the exact charts the dueña sees
// on screen, works on phones too, and needs no PDF library on either side.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "../../_lib/useFetch";
import { useAuth } from "../../_lib/auth";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { money } from "../../_lib/format";
import {
  ClientMixChart,
  MonthlyRevenueChart,
  StatusDonutChart,
  StylistRevenueChart,
  TopServicesChart,
  WeekdayChart,
} from "../../_components/dashboard/Charts";

type Report = {
  period: { year: number; month: number | null; from: string; to: string; timezone: string };
  availableYears: number[];
  summary: {
    revenueCents: number;
    paymentsCount: number;
    completedRevenueCents: number;
    appointmentsTotal: number;
    completed: number;
    cancelled: number;
    noShow: number;
    pending: number;
    confirmed: number;
    avgTicketCents: number;
    newClients: number;
    clientsServed: number;
  };
  previous: {
    revenueCents: number;
    completedRevenueCents: number;
    completed: number;
    newClients: number;
  };
  revenueSeries: { key: string; label: string; cents: number }[];
  revenueByStylist: { name: string; count: number; cents: number }[];
  services: { name: string; count: number; cents: number }[];
  statusDistribution: { status: string; count: number }[];
  weekdayOccupancy: number[];
  clientMix: { newCount: number; returningCount: number };
  paymentsByMethod: { method: string; count: number; cents: number }[];
};

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const METHOD_LABEL: Record<string, string> = {
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  CASH: "Efectivo",
  WALLET: "Billetera digital",
};

function now() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

// Percentage change vs. the previous period; null when there's no baseline
// so the UI can say "sin datos previos" instead of a misleading +∞%.
function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function DeltaBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <div className="mt-1.5 text-[10px] text-mauve-400 truncate">Sin {label} anterior</div>;
  const up = value > 0;
  const flat = value === 0;
  return (
    <div
      className={`mt-1.5 text-[10px] font-medium tabular-nums truncate ${
        flat ? "text-mauve-500" : up ? "" : "text-blush-500"
      }`}
      style={flat ? undefined : up ? { color: "#4F8A5B" } : undefined}
    >
      {flat ? "=" : up ? "▲" : "▼"} {Math.abs(value)}% vs. {label} anterior
    </div>
  );
}

function KpiTile({
  label,
  value,
  sub,
  tone,
  children,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`min-w-0 rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${tone} overflow-hidden print-avoid-break`}>
      <div className="text-[9px] sm:text-[11px] uppercase tracking-wider text-mauve-700 font-medium truncate">{label}</div>
      <div className="mt-2 font-serif text-xl sm:text-3xl text-mauve-900 truncate leading-tight" title={value}>
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-mauve-600 truncate">{sub}</div>}
      {children}
    </div>
  );
}

function DetailTable({
  title,
  columns,
  rows,
  footer,
}: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  footer?: (string | number)[];
}) {
  return (
    <div className="card-surface p-5 sm:p-6 min-w-0 overflow-hidden print-avoid-break">
      <h3 className="font-serif text-lg text-mauve-900 leading-tight">{title}</h3>
      {rows.length === 0 ? (
        <div className="h-20 grid place-items-center text-xs text-mauve-400">Sin datos en este periodo.</div>
      ) : (
        <div className="mt-4 overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-[360px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-mauve-400">
                {columns.map((c, i) => (
                  <th key={c} className={`px-1 pb-2 font-medium ${i === 0 ? "text-left" : "text-right"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-1 py-2 ${
                        ci === 0 ? "text-left text-mauve-900 font-medium truncate max-w-[200px]" : "text-right text-mauve-700 tabular-nums"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {footer && (
              <tfoot>
                <tr className="border-t border-line">
                  {footer.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-1 pt-2 font-medium text-mauve-900 ${ci === 0 ? "text-left" : "text-right tabular-nums"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const { user } = useAuth();
  const currency = user?.salon?.currency ?? "USD";
  const salonName = user?.salon?.name ?? "Tu salón";

  const [today] = useState(now);
  const [year, setYear] = useState<number>(today.year);
  // null = whole year
  const [month, setMonth] = useState<number | null>(today.month);

  const path = month
    ? `/salon/me/reports?year=${year}&month=${month}`
    : `/salon/me/reports?year=${year}`;
  const { data, loading, error, refetch } = useApi<{ report: Report }>(path, [path]);
  const r = data?.report;

  const years = r?.availableYears?.length ? r.availableYears : [today.year];
  const periodLabel = month ? `${MONTHS[month - 1]} ${year}` : `Año ${year}`;
  const periodWord = month ? "mes" : "año";
  const isCurrent = month ? year === today.year && month === today.month : year === today.year;
  const canGoForward = month
    ? year < today.year || (year === today.year && month < today.month)
    : year < today.year;

  const shift = (dir: -1 | 1) => {
    if (month) {
      const d = new Date(year, month - 1 + dir, 1);
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
    } else {
      setYear((y) => y + dir);
    }
  };

  const goToCurrent = () => {
    setYear(today.year);
    setMonth(month ? today.month : null);
  };

  // The browser's "Guardar como PDF" uses document.title as the filename.
  const downloadPdf = () => {
    const previous = document.title;
    document.title = `Reporte ${salonName} - ${periodLabel}`;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const s = r?.summary;
  const p = r?.previous;
  const isEmpty = !!s && s.appointmentsTotal === 0 && s.paymentsCount === 0;
  const cancelledTotal = s ? s.cancelled + s.noShow : 0;
  const cancelRate = s && s.appointmentsTotal > 0 ? Math.round((cancelledTotal / s.appointmentsTotal) * 100) : 0;

  const seriesData = useMemo(
    () => (r ? r.revenueSeries.map((b) => ({ month: b.key, cents: b.cents })) : []),
    [r]
  );
  const seriesLabel = (key: string) => {
    const b = r?.revenueSeries.find((x) => x.key === key);
    if (!b) return "";
    return month ? b.label : MONTH_SHORT[Number(b.label) - 1] ?? b.label;
  };

  const stylistTotal = r ? r.revenueByStylist.reduce((a, x) => a + x.cents, 0) : 0;
  const serviceTotalCount = r ? r.services.reduce((a, x) => a + x.count, 0) : 0;
  const serviceTotalCents = r ? r.services.reduce((a, x) => a + x.cents, 0) : 0;

  const generatedAt = new Date().toLocaleString("es-EC", { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="space-y-6 max-w-[1400px] min-w-0">
      {/* Screen header + filters */}
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Finanzas</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Reportes</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => shift(-1)}
            aria-label={month ? "Mes anterior" : "Año anterior"}
            className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <select
            aria-label="Mes"
            value={month ?? ""}
            onChange={(e) => setMonth(e.target.value === "" ? null : Number(e.target.value))}
            className="h-10 rounded-full bg-mauve-900/5 hover:bg-mauve-900/10 px-4 text-sm text-mauve-900 border-0 focus:outline-none focus:ring-2 focus:ring-gold-400/40 cursor-pointer"
          >
            <option value="">Todo el año</option>
            {MONTHS.map((name, i) => {
              const m = i + 1;
              const future = year === today.year && m > today.month;
              return (
                <option key={m} value={m} disabled={future}>
                  {name}
                </option>
              );
            })}
          </select>

          <select
            aria-label="Año"
            value={year}
            onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              // Avoid landing on a future month when jumping to the current year.
              if (month && y === today.year && month > today.month) setMonth(today.month);
            }}
            className="h-10 rounded-full bg-mauve-900/5 hover:bg-mauve-900/10 px-4 text-sm text-mauve-900 border-0 focus:outline-none focus:ring-2 focus:ring-gold-400/40 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => shift(1)}
            disabled={!canGoForward}
            aria-label={month ? "Mes siguiente" : "Año siguiente"}
            className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0 disabled:opacity-40 disabled:hover:bg-mauve-900/5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {!isCurrent && (
            <button onClick={goToCurrent} className="btn btn-ghost h-10 text-xs">
              {month ? "Este mes" : "Este año"}
            </button>
          )}

          <button
            onClick={downloadPdf}
            disabled={!r}
            className="btn btn-primary h-10 text-sm disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Paper header — only visible when printing */}
      <div className="print-only">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-mauve-400">{salonName}</div>
            <h1 className="font-serif text-3xl text-mauve-900 leading-tight mt-1">Reporte · {periodLabel}</h1>
          </div>
          <div className="text-right text-[10px] text-mauve-500 leading-relaxed">
            <div>Generado el {generatedAt}</div>
            {r && <div>Zona horaria {r.period.timezone}</div>}
          </div>
        </div>
      </div>

      {loading && !r ? (
        <LoadingBlock label="Armando el reporte" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : r && s && p ? (
        <>
          {/* Period line on screen (header on paper already says it) */}
          <div className="no-print flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl sm:text-2xl text-mauve-900 capitalize">{periodLabel}</h2>
            <span className="text-[10px] uppercase tracking-wider text-mauve-400">
              {isCurrent ? `${month ? "Mes" : "Año"} en curso` : "Periodo cerrado"}
            </span>
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 print-grid-3">
            <KpiTile
              label="Ingresos cobrados"
              value={money(s.revenueCents, currency)}
              sub={`${s.paymentsCount} ${s.paymentsCount === 1 ? "pago aprobado" : "pagos aprobados"}`}
              tone="from-gold-300/40 to-gold-300/60"
            >
              <DeltaBadge value={delta(s.revenueCents, p.revenueCents)} label={periodWord} />
            </KpiTile>
            <KpiTile
              label="Facturado en citas"
              value={money(s.completedRevenueCents, currency)}
              sub="Citas completadas"
              tone="from-blush-100 to-blush-200"
            >
              <DeltaBadge value={delta(s.completedRevenueCents, p.completedRevenueCents)} label={periodWord} />
            </KpiTile>
            <KpiTile
              label="Citas completadas"
              value={String(s.completed)}
              sub={`de ${s.appointmentsTotal} agendadas`}
              tone="from-lavender-100 to-lavender-200"
            >
              <DeltaBadge value={delta(s.completed, p.completed)} label={periodWord} />
            </KpiTile>
            <KpiTile
              label="Ticket promedio"
              value={money(s.avgTicketCents, currency)}
              sub="Por cita completada"
              tone="from-nude-200 to-nude-300"
            />
            <KpiTile
              label="Clientas nuevas"
              value={String(s.newClients)}
              sub={`${s.clientsServed} ${s.clientsServed === 1 ? "clienta atendida" : "clientas atendidas"}`}
              tone="from-blush-100 to-blush-200"
            >
              <DeltaBadge value={delta(s.newClients, p.newClients)} label={periodWord} />
            </KpiTile>
            <KpiTile
              label="Canceladas / no asistió"
              value={String(cancelledTotal)}
              sub={s.appointmentsTotal > 0 ? `${cancelRate}% de las agendadas` : "Sin citas agendadas"}
              tone="from-lavender-100 to-lavender-200"
            />
          </div>

          {isEmpty ? (
            <EmptyBlock
              title={`Sin movimientos en ${month ? "este mes" : "este año"}`}
              description="No hay citas ni pagos aprobados en el periodo elegido. Prueba con otro mes o año."
              action={
                !isCurrent ? (
                  <button onClick={goToCurrent} className="btn btn-primary h-10 text-sm">
                    {month ? "Ir a este mes" : "Ir a este año"}
                  </button>
                ) : (
                  <Link href="/dashboard/appointments" className="btn btn-primary h-10 text-sm">
                    Ir al calendario
                  </Link>
                )
              }
            />
          ) : (
            <>
              {/* Revenue over time */}
              <MonthlyRevenueChart
                data={seriesData}
                currency={currency}
                title={month ? "Ingresos cobrados · por día" : "Ingresos cobrados · por mes"}
                formatLabel={seriesLabel}
                labelEvery={month ? 5 : 1}
              />

              {/* Breakdown charts */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 print-grid-3">
                <StylistRevenueChart
                  data={r.revenueByStylist}
                  currency={currency}
                  subtitle={periodLabel}
                  emptyMsg="Sin citas completadas en este periodo."
                />
                <TopServicesChart
                  data={r.services.slice(0, 5)}
                  currency={currency}
                  subtitle={periodLabel}
                  emptyMsg="Sin servicios completados en este periodo."
                />
                <StatusDonutChart
                  data={r.statusDistribution}
                  subtitle={periodLabel}
                  emptyMsg="Sin citas registradas en este periodo."
                />
                <WeekdayChart
                  data={r.weekdayOccupancy}
                  subtitle={periodLabel}
                  emptyMsg="Sin citas en este periodo."
                />
                <ClientMixChart
                  data={r.clientMix}
                  title={month ? "Clientas del mes" : "Clientas del año"}
                  emptyMsg="Sin clientas atendidas en este periodo."
                />

                {/* Payments by method — small inline card, same look as ChartCard */}
                <div className="card-surface p-5 sm:p-6 min-w-0 overflow-hidden">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-lg text-mauve-900 leading-tight">Formas de pago</h3>
                    <span className="text-[10px] uppercase tracking-wider text-mauve-400 shrink-0">Pagos aprobados</span>
                  </div>
                  <div className="mt-4">
                    {r.paymentsByMethod.length === 0 ? (
                      <div className="h-32 grid place-items-center text-xs text-mauve-400 text-center px-4">
                        Sin pagos aprobados en este periodo.
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {r.paymentsByMethod.map((m) => {
                          const pct = s.revenueCents > 0 ? (m.cents / s.revenueCents) * 100 : 0;
                          return (
                            <li key={m.method}>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-mauve-700 truncate font-medium">
                                  {METHOD_LABEL[m.method] ?? m.method}
                                  <span className="text-mauve-400 font-normal"> · {m.count}</span>
                                </span>
                                <span className="text-mauve-600 tabular-nums font-mono ml-2 whitespace-nowrap">
                                  {money(m.cents, currency)} · {Math.round(pct)}%
                                </span>
                              </div>
                              <div className="mt-1 h-2 rounded-full bg-mauve-900/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-mauve-800 to-mauve-900"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail tables — the part a contadora actually wants */}
              <div className="grid lg:grid-cols-2 gap-4">
                <DetailTable
                  title="Detalle por estilista"
                  columns={["Estilista", "Citas", "Facturado", "% del total"]}
                  rows={r.revenueByStylist.map((x) => [
                    x.name,
                    x.count,
                    money(x.cents, currency),
                    stylistTotal > 0 ? `${Math.round((x.cents / stylistTotal) * 100)}%` : "0%",
                  ])}
                  footer={["Total", s.completed, money(stylistTotal, currency), stylistTotal > 0 ? "100%" : "0%"]}
                />
                <DetailTable
                  title="Detalle por servicio"
                  columns={["Servicio", "Veces", "Facturado", "Promedio"]}
                  rows={r.services.map((x) => [
                    x.name,
                    x.count,
                    money(x.cents, currency),
                    money(x.count > 0 ? Math.round(x.cents / x.count) : 0, currency),
                  ])}
                  footer={[
                    "Total",
                    serviceTotalCount,
                    money(serviceTotalCents, currency),
                    money(serviceTotalCount > 0 ? Math.round(serviceTotalCents / serviceTotalCount) : 0, currency),
                  ]}
                />
              </div>
            </>
          )}

          <p className="text-[11px] text-mauve-400 leading-relaxed max-w-3xl">
            <strong className="font-medium text-mauve-500">Ingresos cobrados</strong> suma los pagos aprobados según la
            fecha en que se registraron. <strong className="font-medium text-mauve-500">Facturado en citas</strong> suma el
            precio de las citas completadas según la fecha de la cita; el desglose por estilista y por servicio sale de
            esta cifra. Pueden diferir cuando una cita se paga en un {periodWord} distinto al que se realizó.
          </p>
        </>
      ) : null}
    </div>
  );
}
