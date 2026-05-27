"use client";

import Link from "next/link";
import { useApi } from "../_lib/useFetch";
import { LoadingBlock, ErrorBlock } from "../_components/dashboard/States";
import { money } from "../_lib/format";
import type { AdminMetrics, AdminSalon } from "../_lib/types";

export default function AdminOverviewPage() {
  const metricsQ = useApi<{ metrics: AdminMetrics }>("/admin/metrics");
  const salonsQ = useApi<{ salons: AdminSalon[] }>("/admin/salons");

  if (metricsQ.loading && !metricsQ.data) return <LoadingBlock label="Cargando métricas" />;
  if (metricsQ.error) return <ErrorBlock error={metricsQ.error} onRetry={metricsQ.refetch} />;
  const m = metricsQ.data!.metrics;

  const recentSalons = (salonsQ.data?.salons ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-mauve-400">Glowbook · platform</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Tu negocio en vivo</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="MRR estimado" val={money(m.mrrCents)} tone="from-blush-100 to-blush-200" hint={`${m.activeSubs} activas`} />
        <Kpi label="Ingresos del mes" val={money(m.monthRevenueCents)} tone="from-gold-300/40 to-gold-300/60" hint="cobros aprobados" />
        <Kpi label="Salones totales" val={String(m.totalSalons)} tone="from-lavender-100 to-lavender-200" hint={`${m.lifetimeSubs} lifetime`} />
        <Kpi label="Por revisar" val={String(m.pendingPayments)} tone="from-nude-200 to-nude-300" hint={`${m.overdueSubs} vencidas`} />
      </div>

      {m.pendingPayments > 0 && (
        <Link
          href="/admin/receipts"
          className="block rounded-3xl border border-gold-400/30 bg-gradient-to-br from-cream-soft via-ivory to-gold-300/10 p-6 relative overflow-hidden hover:shadow-[var(--shadow-elevated)] transition"
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold-300/30 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-mauve-400">Comprobantes pendientes</div>
              <div className="font-serif text-2xl text-mauve-900 mt-1">
                {m.pendingPayments} esperando tu aprobación
              </div>
              <p className="text-xs text-mauve-600 mt-1">Cada uno extiende el plan de un salón.</p>
            </div>
            <span className="btn btn-gold h-10 px-5 text-sm">Revisar →</span>
          </div>
        </Link>
      )}

      <section className="card-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-mauve-900">Salones recientes</h2>
          <Link href="/admin/salons" className="text-xs text-mauve-700 underline-offset-4 hover:underline">
            Ver todos →
          </Link>
        </div>
        {salonsQ.loading && !salonsQ.data ? (
          <div className="mt-4"><LoadingBlock label="Cargando" /></div>
        ) : recentSalons.length === 0 ? (
          <p className="mt-4 text-sm text-mauve-500">Aún no hay salones registrados.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {recentSalons.map((s) => (
              <li key={s.id} className="py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif text-sm">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-mauve-900 truncate">{s.name}</div>
                  <div className="text-[11px] text-mauve-400 truncate font-mono">glowbook.app/{s.slug}</div>
                </div>
                <SubBadge status={s.subscription?.status ?? "TRIAL"} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, val, hint, tone }: { label: string; val: string; hint?: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${tone}`}>
      <div className="text-[11px] uppercase tracking-wider text-mauve-600 font-medium">{label}</div>
      <div className="mt-1 font-serif text-2xl text-mauve-900">{val}</div>
      {hint && <div className="text-[11px] text-mauve-600 mt-0.5">{hint}</div>}
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  TRIAL: "status-pending",
  ACTIVE: "status-completed",
  OVERDUE: "status-pending",
  SUSPENDED: "status-cancelled",
  CANCELLED: "chip-cream",
  LIFETIME: "chip-gold",
};
const STATUS_LABEL: Record<string, string> = {
  TRIAL: "Prueba",
  ACTIVE: "Activa",
  OVERDUE: "Vencida",
  SUSPENDED: "Suspendida",
  CANCELLED: "Cancelada",
  LIFETIME: "Lifetime ✦",
};
function SubBadge({ status }: { status: string }) {
  return <span className={`chip ${STATUS_BADGE[status] ?? "chip-cream"} text-[10px]`}>{STATUS_LABEL[status] ?? status}</span>;
}
