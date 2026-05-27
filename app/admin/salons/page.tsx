"use client";

import { useMemo, useState } from "react";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { formatDate } from "../../_lib/format";
import type { AdminSalon, SubStatus } from "../../_lib/types";

const STATUS_BADGE: Record<SubStatus, string> = {
  TRIAL: "status-pending",
  ACTIVE: "status-completed",
  OVERDUE: "status-pending",
  SUSPENDED: "status-cancelled",
  CANCELLED: "chip-cream",
  LIFETIME: "chip-gold",
};
const STATUS_LABEL: Record<SubStatus, string> = {
  TRIAL: "Prueba",
  ACTIVE: "Activa",
  OVERDUE: "Vencida",
  SUSPENDED: "Suspendida",
  CANCELLED: "Cancelada",
  LIFETIME: "Lifetime ✦",
};

const ALL_STATUSES: SubStatus[] = ["TRIAL", "ACTIVE", "OVERDUE", "SUSPENDED", "CANCELLED", "LIFETIME"];

export default function AdminSalonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubStatus | "">("");

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    return p.toString();
  }, [search, status]);

  const { data, loading, error, refetch } = useApi<{ salons: AdminSalon[] }>(
    `/admin/salons${query ? `?${query}` : ""}`,
    [query]
  );

  const salons = data?.salons ?? [];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-mauve-400">Salones</div>
        <h1 className="font-serif text-3xl text-mauve-900 leading-tight">Tus clientas (salones)</h1>
      </div>

      <div className="card-surface p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o slug…"
            className="input-soft pl-10 h-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setStatus("")}
            className={`chip ${!status ? "bg-mauve-900 text-cream" : "chip-cream"} transition`}
          >
            Todos
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s === status ? "" : s)}
              className={`chip ${status === s ? "bg-mauve-900 text-cream" : STATUS_BADGE[s]} transition`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <LoadingBlock label="Cargando salones" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : salons.length === 0 ? (
        <EmptyBlock title="Sin resultados" description="Ningún salón coincide con el filtro." />
      ) : (
        <div className="card-surface p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream-soft text-[11px] uppercase tracking-wider text-mauve-400">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Salón</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Plan</th>
                <th className="text-left px-5 py-3 font-medium">Vencimiento</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Equipo · citas</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {salons.map((s) => {
                const sub = s.subscription;
                return (
                  <tr key={s.id} className="hover:bg-cream/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif text-sm">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-mauve-900 truncate">{s.name}</div>
                          <div className="text-[10px] text-mauve-400">desde {formatDate(s.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-mauve-500 font-mono hidden md:table-cell">{s.slug}</td>
                    <td className="px-5 py-3.5 text-sm text-mauve-700">
                      {sub?.plan === "LIFETIME" ? "Lifetime" : "Mensual"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-mauve-700">
                      {sub?.status === "LIFETIME"
                        ? "—"
                        : sub?.currentPeriodEnd
                        ? formatDate(sub.currentPeriodEnd)
                        : sub?.trialEndsAt
                        ? `Trial · ${formatDate(sub.trialEndsAt)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-mauve-600 hidden lg:table-cell">
                      {s._count.members} · {s._count.appointments} citas
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`chip ${STATUS_BADGE[sub?.status ?? "TRIAL"]}`}>
                        {STATUS_LABEL[sub?.status ?? "TRIAL"]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
