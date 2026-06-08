"use client";

import { useEffect, useState } from "react";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import { money, formatDate } from "../../_lib/format";
import type { PlatformInfo, Subscription, SubscriptionPayment } from "../../_lib/types";

type BillingResp = {
  subscription: Subscription;
  platform: PlatformInfo;
  payments: SubscriptionPayment[];
};

const STATUS_BADGE: Record<Subscription["status"], string> = {
  TRIAL: "status-pending",
  ACTIVE: "status-completed",
  OVERDUE: "status-pending",
  SUSPENDED: "status-cancelled",
  CANCELLED: "chip-cream",
  LIFETIME: "status-completed",
};
const STATUS_LABEL: Record<Subscription["status"], string> = {
  TRIAL: "Prueba",
  ACTIVE: "Al día",
  OVERDUE: "Vencida",
  SUSPENDED: "Suspendida",
  CANCELLED: "Cancelada",
  LIFETIME: "Lifetime ✦",
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

export default function BillingPage() {
  const { data, loading, error, refetch } = useApi<BillingResp>("/subscription/me");
  // Post-payment redirect feedback from Recurrente (?success / ?cancelled).
  // Read from the URL on mount, then clean it so a refresh doesn't re-show it.
  const [payResult, setPayResult] = useState<"success" | "cancelled" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setPayResult("success");
      // The webhook activates the subscription a few seconds after redirect;
      // refetch shortly after so the status card reflects the new plan.
      const t = setTimeout(() => refetch(), 3000);
      window.history.replaceState(null, "", window.location.pathname);
      return () => clearTimeout(t);
    }
    if (params.get("cancelled") === "true") {
      setPayResult("cancelled");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [refetch]);

  if (loading && !data) return <LoadingBlock label="Cargando tu plan" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;
  if (!data) return null;

  const { subscription: sub, platform, payments } = data;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="text-xs text-mauve-400">Plan & facturación</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Tu suscripción</h1>
        <p className="mt-2 text-mauve-600 max-w-xl text-sm">
          Paga con tarjeta de débito o crédito y tu suscripción se activa al instante.
        </p>
      </div>

      {/* Post-payment feedback banner */}
      {payResult === "success" && (
        <section className="rounded-2xl border border-gold-400/50 bg-gold-50/70 px-5 py-4 flex items-start gap-3">
          <svg className="mt-0.5 shrink-0 text-gold-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
          <div>
            <p className="font-medium text-sm text-gold-800">¡Pago recibido! 🎉</p>
            <p className="text-xs text-mauve-600 mt-0.5">
              Tu suscripción se está activando. Puede tardar unos segundos en reflejarse aquí.
            </p>
          </div>
          <button onClick={() => setPayResult(null)} className="ml-auto shrink-0 text-mauve-400 hover:text-mauve-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </section>
      )}
      {payResult === "cancelled" && (
        <section className="rounded-2xl border border-blush-300/60 bg-blush-50 px-5 py-4 flex items-start gap-3">
          <svg className="mt-0.5 shrink-0 text-blush-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <div>
            <p className="font-medium text-sm text-blush-700">Pago cancelado</p>
            <p className="text-xs text-mauve-600 mt-0.5">
              No se realizó ningún cargo. Puedes intentar de nuevo cuando quieras.
            </p>
          </div>
          <button onClick={() => setPayResult(null)} className="ml-auto shrink-0 text-mauve-400 hover:text-mauve-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </section>
      )}

      {/* Trial expiration banner */}
      {sub.status === "TRIAL" && sub.trialEndsAt && (() => {
        const daysLeft = Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86_400_000);
        if (daysLeft > 7) return null;
        const urgent = daysLeft <= 2;
        return (
          <section className={`rounded-2xl border px-5 py-4 flex flex-wrap items-center justify-between gap-4 ${urgent ? "bg-blush-50 border-blush-300/60" : "bg-gold-50/60 border-gold-300/60"}`}>
            <div className="flex items-start gap-3">
              <svg className={`mt-0.5 shrink-0 ${urgent ? "text-blush-500" : "text-gold-600"}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <div>
                <p className={`font-medium text-sm ${urgent ? "text-blush-700" : "text-gold-800"}`}>
                  {daysLeft <= 0 ? "Tu prueba gratuita ha terminado" : daysLeft === 1 ? "Tu prueba termina mañana" : `Tu prueba termina en ${daysLeft} días`}
                </p>
                <p className="text-xs text-mauve-600 mt-0.5">
                  Activa tu suscripción para seguir usando Ecodama sin interrupciones.
                </p>
              </div>
            </div>
            {platform.recurrenteUrl && (
              <a href={platform.recurrenteUrl} target="_blank" rel="noreferrer"
                className={`btn h-9 text-sm shrink-0 ${urgent ? "btn-primary" : "btn-outline"}`}>
                Activar suscripción →
              </a>
            )}
          </section>
        );
      })()}

      {/* Status card */}
      <section className="card-elevated p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className={`chip ${STATUS_BADGE[sub.status]}`}>{STATUS_LABEL[sub.status]}</span>
              <span className="text-xs text-mauve-400">Plan {sub.plan === "LIFETIME" ? "Lifetime" : sub.plan === "YEARLY" ? "Anual" : "Mensual"}</span>
            </div>
            <div className="mt-4">
              {sub.status === "LIFETIME" ? (
                <div className="font-serif text-2xl text-gold-shimmer">Acceso de por vida</div>
              ) : sub.status === "TRIAL" ? (
                <>
                  <div className="text-xs text-mauve-400">Prueba gratuita hasta</div>
                  <div className="font-serif text-2xl text-mauve-900">
                    {sub.trialEndsAt ? formatDate(sub.trialEndsAt) : "—"}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs text-mauve-400">Próxima renovación</div>
                  <div className="font-serif text-2xl text-mauve-900">
                    {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—"}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-mauve-400">Costo del plan</div>
            <div className="font-serif text-3xl text-mauve-900">
              {sub.plan === "LIFETIME" ? money(platform.lifetimePriceCents) : sub.plan === "YEARLY" ? money(platform.yearlyPriceCents) : money(platform.monthlyPriceCents)}
            </div>
            <div className="text-xs text-mauve-400 mt-1">
              {sub.plan === "LIFETIME" ? "USD único pago" : sub.plan === "YEARLY" ? "USD / año" : "USD / mes"}
            </div>
          </div>
        </div>
      </section>

      {/* Card payment via Recurrente */}
      {sub.status !== "LIFETIME" && (
        <section className="card-elevated p-6 border-2 border-mauve-900/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl text-mauve-900">Pagar con tarjeta</h2>
                <span className="chip chip-gold text-[10px]">Recomendado</span>
              </div>
              <p className="text-sm text-mauve-600 mt-1">
                Paga de forma segura con tu tarjeta de crédito o débito. Se activa al instante.
              </p>
            </div>
            <div className="flex items-center gap-2 text-mauve-400">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none"><rect width="24" height="16" rx="3" fill="#1A1F71"/><rect x="9" y="3" width="6" height="10" rx="1" fill="#FF5F00"/><circle cx="6.5" cy="8" r="4.5" fill="#EB001B"/><circle cx="17.5" cy="8" r="4.5" fill="#F79E1B"/></svg>
              <svg width="32" height="16" viewBox="0 0 32 16" fill="none"><rect width="32" height="16" rx="3" fill="#016FD0"/><text x="4" y="12" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">AMEX</text></svg>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { id: "MONTHLY" as const, label: "Mensual", price: platform.monthlyPriceCents, period: "/ mes", url: platform.recurrenteUrl, saving: null, highlight: false },
              { id: "YEARLY" as const, label: "Anual", price: platform.yearlyPriceCents, period: "/ año", url: platform.recurrenteYearlyUrl, saving: "Ahorra 17%", highlight: true },
              { id: "LIFETIME" as const, label: "Lifetime", price: platform.lifetimePriceCents, period: "único pago", url: platform.recurrenteLifetimeUrl, saving: null, highlight: false },
            ]).map((option) => (
              <a
                key={option.id}
                href={option.url || "#"}
                target="_blank"
                rel="noreferrer"
                className={`relative rounded-2xl border-2 p-4 flex flex-col text-center transition ${
                  option.highlight
                    ? "border-gold-400 bg-gold-50/50 hover:border-gold-500"
                    : "border-line bg-ivory hover:border-mauve-900/30"
                } ${!option.url ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
              >
                {option.saving && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 chip chip-gold text-[10px] whitespace-nowrap">
                    {option.saving}
                  </span>
                )}
                <span className="font-serif text-base text-mauve-900 mt-1">{option.label}</span>
                <span className="font-serif text-2xl text-mauve-900 mt-1.5">{money(option.price)}</span>
                <span className="text-[11px] text-mauve-500 mt-0.5">{option.period}</span>
                <span className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-full h-9 text-sm font-medium ${
                  option.highlight ? "btn-gold" : "bg-mauve-900 text-cream"
                }`}>
                  Pagar
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-mauve-400">
            Procesado de forma segura por Recurrente · Tu suscripción se activa automáticamente.
          </p>
        </section>
      )}


      {/* History */}
      <section className="card-surface p-0 overflow-hidden">
        <div className="p-4 border-b border-line">
          <h2 className="font-serif text-xl text-mauve-900">Historial de pagos</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-10 text-center text-sm text-mauve-500">Sin pagos aún</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="bg-cream-soft text-[11px] uppercase tracking-wider text-mauve-400">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Fecha</th>
                <th className="text-left px-5 py-3 font-medium">Período</th>
                <th className="text-left px-5 py-3 font-medium">Monto</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Referencia</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-cream/40">
                  <td className="px-5 py-3.5 text-sm text-mauve-700">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3.5 text-sm text-mauve-700">
                    {p.periodMonths >= 999 ? "Lifetime ✦" : `${p.periodMonths} mes${p.periodMonths === 1 ? "" : "es"}`}
                  </td>
                  <td className="px-5 py-3.5 font-serif text-lg text-mauve-900">{money(p.amountCents)}</td>
                  <td className="px-5 py-3.5 text-xs text-mauve-500 font-mono hidden md:table-cell">{p.reference ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`chip ${PAYMENT_BADGE[p.status]}`}>{PAYMENT_LABEL[p.status]}</span>
                    {p.rejectedReason && <div className="text-[10px] text-blush-500 mt-1">{p.rejectedReason}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}
