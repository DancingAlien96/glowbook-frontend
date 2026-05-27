"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useApi } from "../_lib/useFetch";
import { useAuth } from "../_lib/auth";
import { LoadingBlock, ErrorBlock } from "../_components/dashboard/States";
import { formatTime, initials, money } from "../_lib/format";
import { statusChip, translateStatus } from "../_lib/status";
import type { Appointment, Metrics } from "../_lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const currency = user?.salon?.currency ?? "USD";

  const metricsQ = useApi<{ metrics: Metrics }>("/salon/me/metrics");

  const todayRange = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 86_400_000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const apptsQ = useApi<{ appointments: Appointment[] }>(
    `/appointments?from=${encodeURIComponent(todayRange.from)}&to=${encodeURIComponent(todayRange.to)}`
  );

  const m = metricsQ.data?.metrics;
  const upcoming = apptsQ.data?.appointments ?? [];

  const kpis = m
    ? [
        { label: "Citas hoy", val: String(m.todayAppointments), tone: "from-blush-100 to-blush-200" },
        { label: "Ingresos semana", val: money(m.weekRevenueCents, currency), tone: "from-gold-300/40 to-gold-300/60" },
        { label: "Pagos por revisar", val: String(m.pendingPayments), tone: "from-lavender-100 to-lavender-200" },
        { label: "Nuevas clientas (7d)", val: String(m.newClientsThisWeek), tone: "from-nude-200 to-nude-300" },
      ]
    : null;

  const maxBucket = m ? Math.max(1, ...m.weekRevenueBuckets) : 1;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">{new Date().toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">
            Hola {user?.name?.split(" ")[0] ?? ""}, <em className="not-italic text-rose-shimmer">tu día se ve hermoso ✨</em>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/appointments" className="btn btn-primary h-10 text-sm">
            Ver calendario
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>

      {metricsQ.loading && !m ? (
        <LoadingBlock label="Cargando métricas" />
      ) : metricsQ.error ? (
        <ErrorBlock error={metricsQ.error} onRetry={metricsQ.refetch} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis!.map((k) => (
              <div key={k.label} className={`rounded-2xl p-5 bg-gradient-to-br ${k.tone}`}>
                <div className="text-[11px] uppercase tracking-wider text-mauve-600 font-medium">{k.label}</div>
                <div className="mt-2 font-serif text-3xl text-mauve-900">{k.val}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
            <div className="card-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl text-mauve-900">Agenda de hoy</h2>
                  <p className="text-xs text-mauve-400 mt-1">
                    {upcoming.length} {upcoming.length === 1 ? "cita programada" : "citas programadas"}
                  </p>
                </div>
                <Link href="/dashboard/appointments" className="text-xs text-mauve-700 underline-offset-4 hover:underline">
                  Ver todas →
                </Link>
              </div>

              <div className="mt-5">
                {apptsQ.loading && !apptsQ.data ? (
                  <LoadingBlock label="Cargando citas" />
                ) : apptsQ.error ? (
                  <ErrorBlock error={apptsQ.error} onRetry={apptsQ.refetch} />
                ) : upcoming.length === 0 ? (
                  <div className="text-sm text-mauve-500 py-6 text-center">Sin citas hoy. ¡Disfruta tu día!</div>
                ) : (
                  <div className="divide-y divide-line">
                    {upcoming.map((a) => (
                      <div key={a.id} className="py-3 flex items-center gap-3">
                        <div className="text-center w-14 shrink-0">
                          <div className="font-serif text-lg text-mauve-900 leading-none">{formatTime(a.startAt)}</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lavender-200 to-lavender-400 grid place-items-center text-mauve-900 text-sm font-medium shrink-0">
                          {initials(a.client.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-mauve-900 truncate">{a.client.name}</div>
                          <div className="text-xs text-mauve-400 truncate">
                            {a.service.name}
                            {a.stylist ? ` · con ${a.stylist.name}` : ""}
                          </div>
                        </div>
                        <span className={`chip ${statusChip(a.status)}`}>{translateStatus(a.status)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-surface p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-mauve-900">Ingresos · 7 días</h3>
                </div>
                <div className="mt-3 font-serif text-2xl text-mauve-900">{money(m!.weekRevenueCents, currency)}</div>
                <div className="mt-5 h-32 flex items-end gap-2">
                  {m!.weekRevenueBuckets.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-blush-200 via-blush-300 to-blush-400 min-h-[3px]"
                        style={{ height: `${Math.max(3, (v / maxBucket) * 100)}%` }}
                        title={money(v, currency)}
                      />
                      <span className="text-[9px] text-mauve-400">{["L", "M", "M", "J", "V", "S", "D"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {m!.pendingPayments > 0 && (
                <Link
                  href="/dashboard/payments"
                  className="block rounded-3xl border border-gold-400/30 bg-gradient-to-br from-cream-soft via-ivory to-gold-300/10 p-5 relative overflow-hidden hover:shadow-[var(--shadow-elevated)] transition"
                >
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-300/30 blur-3xl" />
                  <div className="relative">
                    <div className="text-xs text-mauve-400">Pagos por revisar</div>
                    <div className="font-serif text-xl text-mauve-900 mt-1">
                      {m!.pendingPayments} comprobante{m!.pendingPayments === 1 ? "" : "s"}
                    </div>
                    <div className="mt-3 text-xs text-gold-600 font-medium">Revisar ahora →</div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

