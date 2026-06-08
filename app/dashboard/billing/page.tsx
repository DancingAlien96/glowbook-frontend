"use client";

import { useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useUploadThing } from "../../_lib/uploadthing";
import { optimizeImage, formatBytes } from "../../_lib/imageOptimize";
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
  const [plan, setPlan] = useState<"MONTHLY" | "YEARLY" | "LIFETIME">("MONTHLY");
  const [months, setMonths] = useState(1);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const { startUpload, isUploading } = useUploadThing("subscriptionReceiptUploader", {
    onUploadError: (e) => setSubmitError(e.message || "No pudimos subir el comprobante."),
  });

  if (loading && !data) return <LoadingBlock label="Cargando tu plan" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;
  if (!data) return null;

  const { subscription: sub, platform, payments } = data;
  const monthlyTotal = platform.monthlyPriceCents * months;
  const total = plan === "LIFETIME" ? platform.lifetimePriceCents : plan === "YEARLY" ? platform.yearlyPriceCents : monthlyTotal;

  const onSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).elements.namedItem("receipt") as HTMLInputElement;
    const picked = fileInput.files?.[0];
    if (!picked) {
      setSubmitError("Selecciona tu comprobante.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Optimize oversized images before uploading (PDFs pass through).
      const { file, originalBytes, optimized } = await optimizeImage(picked, { maxMB: 3, maxDim: 2000 });
      const uploaded = await startUpload([file]);
      const u = uploaded?.[0];
      if (!u) throw new Error("La subida fue cancelada.");
      await api("/subscription/me/receipts", {
        method: "POST",
        body: {
          url: u.ufsUrl,
          name: u.name,
          reference: reference || undefined,
          plan,
          periodMonths: plan === "LIFETIME" ? 999 : months,
        },
      });
      setSavedAt(Date.now());
      setReference("");
      fileInput.value = "";
      if (optimized) {
        console.info(`[billing] receipt optimized from ${formatBytes(originalBytes)} to ${formatBytes(file.size)}`);
      }
      await refetch();
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "Error al registrar el comprobante.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="text-xs text-mauve-400">Plan & facturación</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Tu suscripción</h1>
        <p className="mt-2 text-mauve-600 max-w-xl text-sm">
          Paga con tarjeta de débito o crédito y tu suscripción se activa al instante. También puedes pagar por transferencia bancaria si lo prefieres.
        </p>
      </div>

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
              <span className="text-xs text-mauve-400">Plan {sub.plan === "LIFETIME" ? "Lifetime" : "Mensual"}</span>
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
              { id: "MONTHLY" as const, label: "Mensual", price: platform.monthlyPriceCents, url: platform.recurrenteUrl },
              { id: "YEARLY" as const, label: "Anual", price: platform.yearlyPriceCents, url: platform.recurrenteYearlyUrl, saving: true },
              { id: "LIFETIME" as const, label: "Lifetime", price: platform.lifetimePriceCents, url: platform.recurrenteLifetimeUrl },
            ]).map((option) => (
              <a
                key={option.id}
                href={option.url || "#"}
                target="_blank"
                rel="noreferrer"
                className={`btn h-16 transition flex flex-col items-center justify-center gap-1.5 px-4 ${option.url ? "btn-primary" : "btn-outline opacity-50 cursor-not-allowed"}`}
              >
                <span className="font-medium text-base">{option.label}</span>
                <span className="text-sm font-semibold">{money(option.price)}</span>
                {option.id !== "LIFETIME" && <span className="text-[10px] opacity-80">/{option.id === "YEARLY" ? "año" : "mes"}</span>}
                {option.saving && <span className="text-xs font-medium opacity-90 mt-0.5">Ahorra 17%</span>}
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
