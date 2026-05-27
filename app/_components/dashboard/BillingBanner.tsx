"use client";

import Link from "next/link";
import { useApi } from "../../_lib/useFetch";
import type { Subscription } from "../../_lib/types";

type Resp = { subscription: Subscription };

/**
 * Top-of-dashboard banner that nudges (or blocks) the owner depending on
 * her subscription status. Hidden when ACTIVE / LIFETIME with > 5 days left.
 */
export default function BillingBanner() {
  const { data } = useApi<Resp>("/subscription/me");
  const sub = data?.subscription;
  if (!sub) return null;

  const now = Date.now();
  const daysUntilDue = (() => {
    const ref = sub.currentPeriodEnd ?? sub.trialEndsAt;
    if (!ref) return null;
    return Math.ceil((new Date(ref).getTime() - now) / 86_400_000);
  })();

  // Healthy states: nothing to show.
  if (sub.status === "LIFETIME") return null;
  if ((sub.status === "ACTIVE" || sub.status === "TRIAL") && daysUntilDue !== null && daysUntilDue > 5) return null;

  const tone =
    sub.status === "SUSPENDED" ? "bg-blush-500 text-cream"
    : sub.status === "OVERDUE" ? "bg-blush-300/40 border-blush-400/40 text-mauve-900"
    : "bg-gold-300/30 border-gold-400/40 text-mauve-900";

  const message =
    sub.status === "SUSPENDED"
      ? "Tu suscripción está suspendida. Renueva ahora para reactivar tu salón."
      : sub.status === "OVERDUE"
      ? `Tu suscripción venció ${absDays(daysUntilDue)}. Sube tu comprobante para reactivarla.`
      : sub.status === "TRIAL"
      ? `Tu prueba gratuita termina en ${daysUntilDue} días. Renueva para no perder acceso.`
      : `Tu suscripción vence en ${daysUntilDue} días. Renueva con un click.`;

  return (
    <div className={`mx-4 sm:mx-8 mt-4 rounded-2xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${tone}`}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl shrink-0">{sub.status === "SUSPENDED" ? "⚠️" : "✦"}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <Link href="/dashboard/billing" className="btn btn-primary h-9 text-xs px-4 shrink-0">
        Ir a facturación
      </Link>
    </div>
  );
}

function absDays(n: number | null): string {
  if (n === null) return "recientemente";
  if (n < 0) return `hace ${-n} día${n === -1 ? "" : "s"}`;
  if (n === 0) return "hoy";
  return `en ${n} día${n === 1 ? "" : "s"}`;
}
