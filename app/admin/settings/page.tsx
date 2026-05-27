"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import type { PlatformSettings } from "../../_lib/types";

export default function AdminSettingsPage() {
  const { data, loading, error, refetch } = useApi<{ settings: PlatformSettings }>("/admin/settings");
  const [form, setForm] = useState<Partial<PlatformSettings>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api("/admin/settings", {
        method: "PATCH",
        body: {
          bankDetails: form.bankDetails ?? null,
          monthlyPriceCents: form.monthlyPriceCents,
          lifetimePriceCents: form.lifetimePriceCents,
          trialDays: form.trialDays,
          graceDays: form.graceDays,
          contactEmail: form.contactEmail ?? null,
          contactWhatsapp: form.contactWhatsapp ?? null,
        },
      });
      await refetch();
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <LoadingBlock label="Cargando ajustes" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <form onSubmit={onSave} className="space-y-6 max-w-3xl">
      <div>
        <div className="text-xs text-mauve-400">Plataforma</div>
        <h1 className="font-serif text-3xl text-mauve-900 leading-tight">Configuración</h1>
        <p className="mt-2 text-sm text-mauve-600">
          Estos datos los ven todas las dueñas de salones cuando van a pagar su suscripción.
        </p>
      </div>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Tus datos bancarios</h2>
        <p className="text-sm text-mauve-600 mt-1">
          La dueña de cada salón los ve en su pantalla de facturación. Sé clara con número de cuenta, nombre y RUC.
        </p>
        <textarea
          rows={5}
          value={form.bankDetails ?? ""}
          onChange={(e) => setForm({ ...form, bankDetails: e.target.value })}
          className="input-soft mt-3 h-auto py-3 resize-none font-mono text-sm"
          placeholder="Banco Pichincha · Cta. Ahorros 2200-100-200
Ecodama S.A.S. · RUC 0999999999001
Referencia: nombre de tu salón"
        />
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Precios</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Plan mensual (centavos)</label>
            <input
              type="number"
              min={0}
              value={form.monthlyPriceCents ?? 0}
              onChange={(e) => setForm({ ...form, monthlyPriceCents: +e.target.value })}
              className="input-soft mt-1.5 font-mono"
            />
            <p className="text-[11px] text-mauve-400 mt-1">2000 = $20.00</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Plan lifetime (centavos)</label>
            <input
              type="number"
              min={0}
              value={form.lifetimePriceCents ?? 0}
              onChange={(e) => setForm({ ...form, lifetimePriceCents: +e.target.value })}
              className="input-soft mt-1.5 font-mono"
            />
            <p className="text-[11px] text-mauve-400 mt-1">66000 = $660.00</p>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Reglas de ciclo</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Días de prueba (nuevos salones)</label>
            <input
              type="number"
              min={0}
              max={365}
              value={form.trialDays ?? 14}
              onChange={(e) => setForm({ ...form, trialDays: +e.target.value })}
              className="input-soft mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Días de gracia tras vencer</label>
            <input
              type="number"
              min={0}
              max={60}
              value={form.graceDays ?? 7}
              onChange={(e) => setForm({ ...form, graceDays: +e.target.value })}
              className="input-soft mt-1.5"
            />
            <p className="text-[11px] text-mauve-400 mt-1">Después de este plazo el salón pasa a SUSPENDIDA.</p>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Contacto para soporte</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Email</label>
            <input
              type="email"
              value={form.contactEmail ?? ""}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="input-soft mt-1.5"
              placeholder="hola@ecodama.online"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">WhatsApp</label>
            <input
              value={form.contactWhatsapp ?? ""}
              onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
              className="input-soft mt-1.5"
              placeholder="+593 99 ..."
            />
          </div>
        </div>
      </section>

      {err && <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}

      <div className="flex items-center justify-end gap-3">
        {savedAt && <span className="text-xs text-mauve-500">Guardado ✓</span>}
        <button type="submit" disabled={saving} className="btn btn-primary h-11 px-6 disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
