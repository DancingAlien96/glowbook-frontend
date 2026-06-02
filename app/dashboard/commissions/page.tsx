"use client";

// Monthly commission report. Picks a month, lists every stylist with how
// many appointments she completed, how much revenue she generated for the
// salon, her commission %, and the resulting amount to pay her.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "../../_lib/useFetch";
import { useAuth } from "../../_lib/auth";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { money, initials } from "../../_lib/format";

type EarningsRow = {
  stylistId: string;
  name: string;
  role: string | null;
  active: boolean;
  commissionPercent: number;
  completedCount: number;
  revenueCents: number;
  commissionCents: number;
};

type EarningsResponse = {
  month: string;
  rows: EarningsRow[];
  totals: { revenueCents: number; commissionCents: number; completedCount: number };
};

// Build a YYYY-MM string for the current month (in local time — same logic the
// backend defaults to, so they line up). 0-indexed Date.getMonth().
function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return new Date(y, m - 1, 1).toLocaleDateString("es-EC", { month: "long", year: "numeric" });
}

const tones = [
  "from-blush-300 to-blush-500",
  "from-lavender-200 to-lavender-400",
  "from-gold-300 to-gold-500",
  "from-nude-200 to-nude-300",
];

export default function CommissionsPage() {
  const { user } = useAuth();
  const currency = user?.salon?.currency ?? "USD";
  const [month, setMonth] = useState<string>(thisMonth());

  const { data, loading, error, refetch } = useApi<EarningsResponse>(
    `/stylists/earnings?month=${month}`,
    [month]
  );

  const rows = data?.rows ?? [];
  const totals = data?.totals;

  // Hide stylists with 0 commission AND 0 completed in the period — they're
  // not contributing to this month's payroll. Toggle controls inclusion.
  const [showAll, setShowAll] = useState(false);
  const visible = useMemo(
    () =>
      showAll
        ? rows
        : rows.filter((r) => r.completedCount > 0 || r.commissionPercent > 0),
    [rows, showAll]
  );

  const isCurrent = month === thisMonth();
  const salonRevenueCents = (totals?.revenueCents ?? 0) - (totals?.commissionCents ?? 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Finanzas</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Comisiones</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            aria-label="Mes anterior"
            className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="h-10 px-4 rounded-full bg-mauve-900/5 flex flex-col items-center justify-center min-w-[150px] leading-none">
            <span className="text-sm font-medium text-mauve-900 capitalize whitespace-nowrap">{monthLabel(month)}</span>
            <span className="text-[10px] text-mauve-400 mt-0.5">{isCurrent ? "Este mes" : "Mes"}</span>
          </div>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            aria-label="Mes siguiente"
            className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          {!isCurrent && (
            <button onClick={() => setMonth(thisMonth())} className="btn btn-ghost h-10 text-xs">Hoy</button>
          )}
        </div>
      </div>

      {/* Totals strip */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="min-w-0 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-gold-300/40 to-gold-300/60">
            <div className="text-[11px] uppercase tracking-wider text-mauve-600 font-medium truncate">Facturado</div>
            <div className="mt-2 font-serif text-2xl sm:text-3xl text-mauve-900 truncate">
              {money(totals.revenueCents, currency)}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-blush-100 to-blush-200">
            <div className="text-[11px] uppercase tracking-wider text-mauve-600 font-medium truncate">A pagar (comisiones)</div>
            <div className="mt-2 font-serif text-2xl sm:text-3xl text-mauve-900 truncate">
              {money(totals.commissionCents, currency)}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-lavender-100 to-lavender-200">
            <div className="text-[11px] uppercase tracking-wider text-mauve-600 font-medium truncate">Queda al salón</div>
            <div className="mt-2 font-serif text-2xl sm:text-3xl text-mauve-900 truncate">
              {money(salonRevenueCents, currency)}
            </div>
          </div>
          <div className="min-w-0 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-nude-200 to-nude-300">
            <div className="text-[11px] uppercase tracking-wider text-mauve-600 font-medium truncate">Citas completadas</div>
            <div className="mt-2 font-serif text-2xl sm:text-3xl text-mauve-900">
              {totals.completedCount}
            </div>
          </div>
        </div>
      )}

      {/* Filter toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-mauve-700 cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="h-4 w-4 accent-mauve-900"
          />
          Mostrar también estilistas sin citas ni comisión configurada
        </label>
      </div>

      {loading && !data ? (
        <LoadingBlock label="Calculando comisiones" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : visible.length === 0 ? (
        <EmptyBlock
          title="Sin datos para este mes"
          description="Las comisiones se calculan sobre citas COMPLETADAS. ¿Tienes equipo con % de comisión configurado?"
          action={
            <Link href="/dashboard/team" className="btn btn-primary h-10 text-sm">Ir a Equipo</Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((r, i) => {
            const muted = !r.active;
            return (
              <article key={r.stylistId} className={`card-surface p-5 ${muted ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tones[i % tones.length]} grid place-items-center text-cream font-serif shrink-0`}>
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-lg text-mauve-900 leading-tight truncate">{r.name}</div>
                    {r.role && <div className="text-xs text-mauve-500 truncate">{r.role}</div>}
                    {muted && <div className="text-[10px] text-blush-500 mt-0.5">Pausada</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] uppercase tracking-wider text-mauve-400">Comisión</div>
                    <div className="font-serif text-lg text-mauve-900 tabular-nums">{r.commissionPercent}%</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-cream-soft/60 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-mauve-400">Citas</div>
                    <div className="text-sm font-medium text-mauve-900 mt-0.5">{r.completedCount}</div>
                  </div>
                  <div className="rounded-xl bg-cream-soft/60 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-mauve-400">Facturado</div>
                    <div className="text-sm font-medium text-mauve-900 mt-0.5 truncate" title={money(r.revenueCents, currency)}>
                      {money(r.revenueCents, currency)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-mauve-400">A pagar</span>
                  <span className="font-serif text-xl text-mauve-900 tabular-nums">
                    {money(r.commissionCents, currency)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
