"use client";

import { useState } from "react";
import { api, ApiError, apiUrl } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { money, formatDate, formatTime } from "../../_lib/format";
import type { SubscriptionPayment } from "../../_lib/types";

type AdminPayment = SubscriptionPayment & {
  subscription: {
    plan: "MONTHLY" | "LIFETIME";
    salon: { id: string; name: string; slug: string };
  };
};

const PAYMENT_BADGE: Record<SubscriptionPayment["status"], string> = {
  PENDING_REVIEW: "status-pending",
  APPROVED: "status-completed",
  REJECTED: "status-cancelled",
};
const PAYMENT_LABEL: Record<SubscriptionPayment["status"], string> = {
  PENDING_REVIEW: "Por revisar",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
};

export default function AdminReceiptsPage() {
  const [tab, setTab] = useState<SubscriptionPayment["status"]>("PENDING_REVIEW");
  const { data, loading, error, refetch } = useApi<{ payments: AdminPayment[] }>(
    `/admin/payments?status=${tab}`,
    [tab]
  );
  const [actingId, setActingId] = useState<string | null>(null);

  const payments = data?.payments ?? [];

  const resolveReceipt = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = apiUrl("/").replace(/\/api\/$/, "");
    return `${base}${url}`;
  };

  const approve = async (id: string) => {
    setActingId(id);
    try {
      await api(`/admin/payments/${id}/approve`, { method: "POST" });
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
      await api(`/admin/payments/${id}/reject`, { method: "POST", body: { rejectedReason: reason } });
      await refetch();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Error");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-mauve-400">Comprobantes de suscripción</div>
        <h1 className="font-serif text-3xl text-mauve-900 leading-tight">Pagos de las salones</h1>
        <p className="mt-2 text-sm text-mauve-600 max-w-xl">
          Aprueba un comprobante para extender el plan del salón automáticamente.
        </p>
      </div>

      <div className="flex gap-1.5">
        {(["PENDING_REVIEW", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`chip ${tab === s ? "bg-mauve-900 text-cream" : PAYMENT_BADGE[s]} transition`}
          >
            {PAYMENT_LABEL[s]}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <LoadingBlock label="Cargando" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : payments.length === 0 ? (
        <EmptyBlock
          title={tab === "PENDING_REVIEW" ? "Nada por revisar ✦" : "Sin pagos en este estado"}
          description={tab === "PENDING_REVIEW" ? "Cuando un salón suba su comprobante aparecerá aquí." : undefined}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {payments.map((p) => {
            const acting = actingId === p.id;
            const receiptUrl = resolveReceipt(p.receiptUrl);
            return (
              <article key={p.id} className="card-elevated p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-mauve-900">{p.subscription.salon.name}</div>
                    <div className="text-[11px] text-mauve-400 mt-0.5 font-mono">{p.subscription.salon.slug}</div>
                  </div>
                  <span className={`chip ${PAYMENT_BADGE[p.status]} text-[10px]`}>{PAYMENT_LABEL[p.status]}</span>
                </div>

                <a
                  href={receiptUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 rounded-2xl border border-dashed border-line-strong bg-gradient-to-br from-cream-soft to-blush-100/40 aspect-[4/3] grid place-items-center text-mauve-400 relative overflow-hidden block"
                >
                  {receiptUrl && /\.(png|jpe?g|gif|webp)$/i.test(receiptUrl) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={receiptUrl} alt="Comprobante" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  )}
                  <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider bg-cream/80 px-2 py-1 rounded-full">
                    {p.receiptName ?? "Comprobante"}
                  </span>
                </a>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-mauve-400">Monto</div>
                    <div className="font-serif text-2xl text-mauve-900">{money(p.amountCents)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-mauve-400">Período</div>
                    <div className="text-sm font-medium text-mauve-900">
                      {p.periodMonths >= 999 ? "Lifetime ✦" : `${p.periodMonths} mes${p.periodMonths === 1 ? "" : "es"}`}
                    </div>
                  </div>
                </div>

                {p.reference && (
                  <div className="mt-3 rounded-xl bg-cream-soft px-3 py-2 text-xs text-mauve-700 font-mono">
                    Ref: {p.reference}
                  </div>
                )}

                {p.status === "PENDING_REVIEW" ? (
                  <div className="mt-4 flex flex-col sm:grid sm:grid-cols-[auto_1fr] gap-2">
                    <button
                      disabled={acting}
                      onClick={() => reject(p.id)}
                      className="btn btn-ghost h-10 text-xs text-blush-500 border-blush-300/30 disabled:opacity-60"
                    >
                      Rechazar
                    </button>
                    <button
                      disabled={acting}
                      onClick={() => approve(p.id)}
                      className="btn btn-primary h-10 text-xs px-4 disabled:opacity-60 whitespace-nowrap"
                    >
                      Aprobar y extender plan
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 text-[11px] text-mauve-400">
                    {p.reviewedAt ? `Revisado ${formatDate(p.reviewedAt)}` : ""}
                    {p.rejectedReason && (
                      <div className="text-blush-500 mt-1">Motivo: {p.rejectedReason}</div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-mauve-400 text-center">
                  Recibido {formatDate(p.createdAt)} · {formatTime(p.createdAt)}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
