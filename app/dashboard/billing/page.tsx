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
  const [plan, setPlan] = useState<"MONTHLY" | "LIFETIME">("MONTHLY");
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
  const total = plan === "LIFETIME" ? platform.lifetimePriceCents : monthlyTotal;

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
          Paga tu plan por transferencia bancaria y sube el comprobante. Ecodama lo revisa y activa tu próximo período.
        </p>
      </div>

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
              {money(sub.plan === "LIFETIME" ? platform.lifetimePriceCents : platform.monthlyPriceCents)}
            </div>
            <div className="text-xs text-mauve-400 mt-1">{sub.plan === "LIFETIME" ? "USD único pago" : "USD / mes"}</div>
          </div>
        </div>
      </section>

      {sub.status !== "LIFETIME" && (
        <section className="card-elevated p-6">
          <h2 className="font-serif text-xl text-mauve-900">Pagar / renovar</h2>
          <p className="text-sm text-mauve-600 mt-1">
            Transfiere a la cuenta de Ecodama y sube tu comprobante. Activamos tu próximo período en cuanto lo aprobemos
            (usualmente en menos de 24h).
          </p>

          <div className="mt-5 grid lg:grid-cols-[1fr_1.2fr] gap-5">
            <div className="rounded-2xl bg-cream-soft p-4 border border-line">
              <div className="text-xs uppercase tracking-wider text-mauve-400">Datos para transferir</div>
              {platform.bankDetails ? (
                <pre className="mt-2 text-sm text-mauve-900 font-mono whitespace-pre-wrap break-words leading-relaxed">{platform.bankDetails}</pre>
              ) : (
                <p className="mt-2 text-sm text-mauve-600">El equipo de Ecodama aún no publicó datos. Contáctanos.</p>
              )}
              {(platform.contactEmail || platform.contactWhatsapp) && (
                <div className="mt-3 pt-3 border-t border-line text-xs text-mauve-600 space-y-1">
                  {platform.contactWhatsapp && <div>WhatsApp · <span className="font-mono">{platform.contactWhatsapp}</span></div>}
                  {platform.contactEmail && <div>Email · <span className="font-mono">{platform.contactEmail}</span></div>}
                </div>
              )}
            </div>

            <form onSubmit={onSubmitReceipt} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Qué pagaste</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    { id: "MONTHLY" as const, t: "Mensual", d: `${money(platform.monthlyPriceCents)} / mes` },
                    { id: "LIFETIME" as const, t: "Lifetime", d: `${money(platform.lifetimePriceCents)} único pago` },
                  ]).map((o) => {
                    const sel = plan === o.id;
                    return (
                      <button
                        type="button"
                        key={o.id}
                        onClick={() => setPlan(o.id)}
                        className={`text-left rounded-2xl border-2 p-3 transition ${sel ? "border-mauve-900 bg-cream-soft" : "border-line bg-ivory hover:border-line-strong"}`}
                      >
                        <div className="font-serif text-base text-mauve-900">{o.t}</div>
                        <div className="text-[11px] text-mauve-600 mt-0.5">{o.d}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {plan === "MONTHLY" && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-mauve-400">Meses a pagar</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setMonths(m)}
                        className={`h-10 flex-1 rounded-xl text-sm font-medium transition ${months === m ? "bg-mauve-900 text-cream" : "bg-mauve-900/5 text-mauve-700 hover:bg-mauve-900/10"}`}
                      >
                        {m} {m === 1 ? "mes" : "meses"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl bg-cream-soft border border-line p-3">
                <span className="text-sm text-mauve-600">Total transferido</span>
                <span className="font-serif text-2xl text-mauve-900">{money(total)}</span>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Referencia (opcional)</label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="input-soft mt-1.5 font-mono"
                  placeholder="Nº de operación o nombre que usaste"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Tu comprobante</label>
                <input
                  type="file"
                  name="receipt"
                  accept="image/*,application/pdf"
                  required
                  className="mt-1.5 block w-full text-sm text-mauve-700 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-mauve-900 file:text-cream file:font-medium file:cursor-pointer hover:file:bg-mauve-800"
                />
                <p className="text-[11px] text-mauve-400 mt-1">PNG, JPG o PDF · si la imagen pasa el límite la optimizamos por ti</p>
              </div>

              {submitError && (
                <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">
                  {submitError}
                </div>
              )}
              {savedAt && (
                <div className="text-sm text-mauve-900 bg-gold-300/30 border border-gold-400/30 rounded-xl px-3 py-2.5">
                  Comprobante enviado ✓ Te avisamos cuando lo aprobemos.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || isUploading}
                className="btn btn-primary w-full h-12 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploading ? "Subiendo…" : submitting ? "Enviando…" : "Enviar comprobante"}
              </button>
            </form>
          </div>
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
