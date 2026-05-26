"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import { initials } from "../../_lib/format";
import type { DepositMode, Salon } from "../../_lib/types";

const DEPOSIT_OPTIONS: Array<{ id: DepositMode; title: string; desc: string }> = [
  { id: "NONE", title: "Sin anticipo", desc: "Las clientas reservan sin pagar." },
  { id: "PERCENTAGE", title: "Anticipo parcial", desc: "Cobra un % del servicio." },
  { id: "FULL", title: "Pago total", desc: "Pago completo por adelantado." },
];

export default function SettingsPage() {
  const { data, loading, error, refetch } = useApi<{ salon: Salon }>("/salon/me");
  const [form, setForm] = useState<Partial<Salon>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (data?.salon) setForm(data.salon);
  }, [data]);

  const update = <K extends keyof Salon>(k: K, v: Salon[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api("/salon/me", {
        method: "PATCH",
        body: {
          name: form.name,
          description: form.description,
          timezone: form.timezone,
          currency: form.currency,
          depositMode: form.depositMode,
          depositPercent: form.depositPercent,
          approvalMode: form.approvalMode,
          bankDetails: form.bankDetails,
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

  const salon = data.salon;

  return (
    <form onSubmit={onSave} className="space-y-6 max-w-4xl">
      <div>
        <div className="text-xs text-mauve-400">Configuración</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Ajustes del salón</h1>
      </div>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Marca & página de reservas</h2>
        <div className="mt-5 grid sm:grid-cols-[120px_1fr] gap-5 items-start">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif text-3xl">
            {initials(form.name ?? salon.name)}
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre del salón</label>
              <input className="input-soft mt-1.5" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">URL pública</label>
              <div className="mt-1.5 flex items-center rounded-2xl border border-line-strong bg-cream-soft overflow-hidden">
                <span className="px-3 text-xs text-mauve-400 font-mono">glowbook.app/</span>
                <span className="flex-1 px-2 py-3 text-sm text-mauve-900 font-mono">{salon.slug}</span>
              </div>
              <div className="mt-1 text-[11px] text-mauve-400">El slug no se puede cambiar después de creado.</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Zona horaria</label>
                <select className="input-soft mt-1.5" value={form.timezone ?? salon.timezone} onChange={(e) => update("timezone", e.target.value)}>
                  {["America/Guayaquil", "America/Lima", "America/Bogota", "America/Mexico_City", "America/Buenos_Aires"].map((tz) => (
                    <option key={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Moneda</label>
                <select className="input-soft mt-1.5" value={form.currency ?? salon.currency} onChange={(e) => update("currency", e.target.value)}>
                  {["USD", "PEN", "COP", "MXN", "ARS"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Política de pagos</h2>
        <p className="text-mauve-600 text-sm mt-1">Define cómo cobras los anticipos para asegurar las citas.</p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          {DEPOSIT_OPTIONS.map((o) => {
            const active = (form.depositMode ?? salon.depositMode) === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => update("depositMode", o.id)}
                className={`text-left rounded-2xl border-2 p-4 transition ${active ? "border-mauve-900 bg-cream-soft" : "border-line bg-ivory hover:border-line-strong"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-serif text-lg text-mauve-900">{o.title}</div>
                  <span className={`h-5 w-5 rounded-full grid place-items-center border-2 ${active ? "bg-mauve-900 border-mauve-900" : "border-line-strong"}`}>
                    {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </span>
                </div>
                <p className="text-xs text-mauve-600 mt-1.5">{o.desc}</p>
              </button>
            );
          })}
        </div>

        {(form.depositMode ?? salon.depositMode) === "PERCENTAGE" && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Porcentaje de anticipo</label>
              <div className="mt-1.5 flex items-center rounded-2xl border border-line-strong bg-ivory overflow-hidden">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="bg-transparent flex-1 px-3 py-3 text-mauve-900 font-serif text-xl outline-none"
                  value={form.depositPercent ?? salon.depositPercent}
                  onChange={(e) => update("depositPercent", +e.target.value)}
                />
                <span className="px-4 text-mauve-400">%</span>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Aprobación de comprobantes</label>
              <select className="input-soft mt-1.5" value={form.approvalMode ?? salon.approvalMode} onChange={(e) => update("approvalMode", e.target.value as Salon["approvalMode"])}>
                <option value="MANUAL">Manual — Yo apruebo cada uno</option>
                <option value="AUTOMATIC">Automática</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="text-xs uppercase tracking-wider text-mauve-400">Datos bancarios (visibles en la página de reserva)</label>
          <textarea
            rows={3}
            value={form.bankDetails ?? ""}
            onChange={(e) => update("bankDetails", e.target.value)}
            placeholder="Banco · Tipo de cuenta · Número · RUC"
            className="input-soft mt-1.5 h-auto py-3 resize-none font-mono text-sm"
          />
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
