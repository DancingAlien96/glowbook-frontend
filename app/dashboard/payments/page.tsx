"use client";

import { useState } from "react";
import { api, ApiError, apiUrl } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useAuth } from "../../_lib/auth";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { money, formatDate, formatTime } from "../../_lib/format";
import { paymentChip, translatePayment } from "../../_lib/status";
import type { Payment } from "../../_lib/types";

export default function PaymentsPage() {
  const { user } = useAuth();
  const currency = user?.ownedSalon?.currency ?? "USD";

  const { data, loading, error, refetch } = useApi<{ payments: Payment[] }>("/payments");
  const [actingId, setActingId] = useState<string | null>(null);

  const payments = data?.payments ?? [];
  const pending = payments.filter((p) => p.status === "PENDING_REVIEW");
  const history = payments.filter((p) => p.status !== "PENDING_REVIEW");

  const monthRevenue = payments
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const approve = async (id: string) => {
    setActingId(id);
    try {
      await api(`/payments/${id}/approve`, { method: "POST" });
      await refetch();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Error");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = prompt("Motivo del rechazo (opcional):") || undefined;
    setActingId(id);
    try {
      await api(`/payments/${id}/reject`, { method: "POST", body: { rejectedReason: reason } });
      await refetch();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Error");
    } finally {
      setActingId(null);
    }
  };

  // Receipt URLs from API are server-relative ("/uploads/..."). Resolve against the API host.
  const resolveReceipt = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = apiUrl("/").replace(/\/api\/$/, "");
    return `${base}${url}`;
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Finanzas</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Pagos & comprobantes</h1>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Aprobado", val: money(monthRevenue, currency), tone: "from-blush-100 to-blush-200" },
          { label: "Por revisar", val: String(pending.length), tone: "from-gold-300/40 to-gold-300/60" },
          { label: "Total transacciones", val: String(payments.length), tone: "from-lavender-100 to-lavender-200" },
          { label: "Rechazados", val: String(payments.filter((p) => p.status === "REJECTED").length), tone: "from-nude-200 to-nude-300" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 bg-gradient-to-br ${s.tone}`}>
            <div className="text-[11px] uppercase tracking-wider text-mauve-600">{s.label}</div>
            <div className="mt-1 font-serif text-2xl text-mauve-900">{s.val}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-mauve-900">Comprobantes pendientes</h2>
          <span className="chip chip-blush">{pending.length} por revisar</span>
        </div>

        {loading && !data ? (
          <div className="mt-4"><LoadingBlock label="Cargando pagos" /></div>
        ) : error ? (
          <div className="mt-4"><ErrorBlock error={error} onRetry={refetch} /></div>
        ) : pending.length === 0 ? (
          <div className="mt-4"><EmptyBlock title="Nada por revisar" description="Cuando alguien suba un comprobante aparecerá aquí." /></div>
        ) : (
          <div className="mt-4 grid lg:grid-cols-3 gap-4">
            {pending.map((p) => {
              const receiptUrl = resolveReceipt(p.receiptUrl);
              const acting = actingId === p.id;
              return (
                <article key={p.id} className="card-elevated p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-mauve-900">{p.appointment.client.name}</div>
                      <div className="text-xs text-mauve-400 mt-0.5">{p.appointment.service.name}</div>
                    </div>
                    <span className="chip status-pending">Por revisar</span>
                  </div>

                  <a
                    href={receiptUrl ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 rounded-2xl border border-dashed border-line-strong bg-gradient-to-br from-cream-soft to-blush-100/40 aspect-[4/3] grid place-items-center text-mauve-400 relative overflow-hidden block"
                  >
                    {receiptUrl && /\.(png|jpe?g|gif|webp)$/i.test(receiptUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={receiptUrl} alt="Comprobante" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    )}
                    <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider bg-cream/80 px-2 py-1 rounded-full">{p.receiptName ?? "Comprobante"}</span>
                  </a>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-mauve-400">Monto</div>
                      <div className="font-serif text-2xl text-mauve-900">{money(p.amountCents, currency)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-mauve-400">Método</div>
                      <div className="text-xs text-mauve-700 mt-0.5">{p.method}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button disabled={acting} onClick={() => reject(p.id)} className="btn btn-ghost h-10 text-xs text-blush-500 border-blush-300/30 disabled:opacity-60">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      Rechazar
                    </button>
                    <button disabled={acting} onClick={() => approve(p.id)} className="btn btn-primary h-10 text-xs disabled:opacity-60">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                      Aprobar
                    </button>
                  </div>
                  <div className="mt-2 text-[10px] text-mauve-400 text-center">{formatDate(p.createdAt)} · {formatTime(p.createdAt)}</div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="card-surface p-0 overflow-hidden">
        <div className="p-4 border-b border-line">
          <h2 className="font-serif text-xl text-mauve-900">Historial</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-10 text-center text-sm text-mauve-500">Sin historial aún</div>
        ) : (
          <table className="w-full">
            <thead className="bg-cream-soft text-[11px] uppercase tracking-wider text-mauve-400">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Clienta</th>
                <th className="text-left px-5 py-3 font-medium">Servicio</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Método</th>
                <th className="text-left px-5 py-3 font-medium">Monto</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.map((p) => (
                <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                  <td className="px-5 py-3.5 text-mauve-900 font-medium">{p.appointment.client.name}</td>
                  <td className="px-5 py-3.5 text-sm text-mauve-600">{p.appointment.service.name}</td>
                  <td className="px-5 py-3.5 text-sm text-mauve-600 hidden md:table-cell">{p.method}</td>
                  <td className="px-5 py-3.5 font-serif text-lg text-mauve-900">{money(p.amountCents, currency)}</td>
                  <td className="px-5 py-3.5"><span className={`chip ${paymentChip(p.status)}`}>{translatePayment(p.status)}</span></td>
                  <td className="px-5 py-3.5 text-xs text-mauve-400 hidden lg:table-cell">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
