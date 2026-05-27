"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useUploadThing } from "../../_lib/uploadthing";
import { optimizeImage, formatBytes } from "../../_lib/imageOptimize";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import { initials } from "../../_lib/format";
import type { DepositMode, Salon } from "../../_lib/types";

const COLOR_SWATCHES = [
  { name: "Rosa nude", hex: "#D89888" },
  { name: "Blush", hex: "#E8B4A1" },
  { name: "Lavanda", hex: "#9F87B8" },
  { name: "Champagne", hex: "#C9A876" },
  { name: "Sage", hex: "#9BAE92" },
  { name: "Mauve", hex: "#8A6E78" },
  { name: "Carbón", hex: "#38272F" },
];

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

  // Cover upload via UploadThing. We save the resulting URL directly.
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverInfo, setCoverInfo] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const { startUpload, isUploading: isUploadingCover } = useUploadThing("coverUploader", {
    onUploadError: (e) => setCoverError(e.message || "No pudimos subir la portada."),
  });

  const onPickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same file
    if (!picked) return;
    setCoverError(null);
    setCoverInfo(null);

    // Compress oversize images before sending. Covers are large hero banners,
    // so we allow a higher target than receipts.
    setOptimizing(true);
    const { file, originalBytes, optimized } = await optimizeImage(picked, { maxMB: 4, maxDim: 2400 });
    setOptimizing(false);
    if (optimized) {
      setCoverInfo(`Optimizada de ${formatBytes(originalBytes)} a ${formatBytes(file.size)} ✦`);
    }

    const result = await startUpload([file]);
    const url = result?.[0]?.ufsUrl;
    if (url) {
      try {
        await api("/salon/me", { method: "PATCH", body: { coverImageUrl: url } });
        await refetch();
        setSavedAt(Date.now());
      } catch (err) {
        setCoverError(err instanceof ApiError ? err.message : "Error al guardar");
      }
    }
  };

  const onRemoveCover = async () => {
    if (!confirm("¿Quitar la portada?")) return;
    try {
      await api("/salon/me", { method: "PATCH", body: { coverImageUrl: null } });
      await refetch();
      setSavedAt(Date.now());
    } catch (err) {
      setCoverError(err instanceof ApiError ? err.message : "Error al guardar");
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api("/salon/me", {
        method: "PATCH",
        body: {
          name: form.name,
          tagline: form.tagline ?? null,
          description: form.description,
          brandColor: form.brandColor,
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-mauve-900">Identidad visual</h2>
            <p className="text-sm text-mauve-600 mt-1">
              Tu portada y color aparecen en{" "}
              <Link href={`/book/${salon.slug}`} target="_blank" className="text-mauve-900 underline-offset-4 hover:underline font-medium">
                tu página pública
              </Link>
              . Da clic para previsualizar.
            </p>
          </div>
        </div>

        {/* Cover preview + upload */}
        <div className="mt-5">
          <div
            className="relative aspect-[3/1] rounded-2xl overflow-hidden border border-line bg-gradient-to-br from-blush-200 to-lavender-200"
            style={
              form.coverImageUrl
                ? { backgroundImage: `url(${form.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!form.coverImageUrl && (
              <div className="absolute inset-0 grid place-items-center text-mauve-600">
                <div className="text-center">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="mx-auto opacity-70"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  <p className="mt-2 text-xs uppercase tracking-wider">Sin portada todavía</p>
                </div>
              </div>
            )}
            {form.coverImageUrl && (
              <button
                type="button"
                onClick={onRemoveCover}
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-mauve-900/60 text-cream backdrop-blur-sm hover:bg-mauve-900/80 transition"
                title="Quitar portada"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="btn btn-ghost h-10 text-sm cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={onPickCover} disabled={isUploadingCover || optimizing} />
              {optimizing ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-mauve-900/30 border-t-mauve-900 animate-spin" />
                  Optimizando…
                </>
              ) : isUploadingCover ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-mauve-900/30 border-t-mauve-900 animate-spin" />
                  Subiendo…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  {form.coverImageUrl ? "Cambiar portada" : "Subir portada"}
                </>
              )}
            </label>
            <span className="text-xs text-mauve-400">JPG o PNG · si pasa el límite la optimizamos por ti · ideal 1600×600</span>
          </div>

          {coverInfo && (
            <div className="mt-3 text-sm text-mauve-900 bg-gold-300/30 border border-gold-400/30 rounded-xl px-3 py-2.5">
              {coverInfo}
            </div>
          )}
          {coverError && (
            <div className="mt-3 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">
              {coverError}
            </div>
          )}
        </div>

        {/* Tagline */}
        <div className="mt-6">
          <label className="text-xs uppercase tracking-wider text-mauve-400">Tagline (frase corta)</label>
          <input
            value={form.tagline ?? ""}
            onChange={(e) => update("tagline", e.target.value)}
            maxLength={160}
            className="input-soft mt-1.5"
            placeholder="Ej. Belleza consciente · Quito"
          />
          <p className="mt-1 text-[11px] text-mauve-400">Aparece debajo del nombre en tu página pública.</p>
        </div>

        {/* Brand color */}
        <div className="mt-6">
          <label className="text-xs uppercase tracking-wider text-mauve-400">Color de marca</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((c) => {
              const active = (form.brandColor ?? salon.brandColor).toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => update("brandColor", c.hex)}
                  title={c.name}
                  className={`h-10 w-10 rounded-full transition ring-offset-2 ring-offset-cream ${active ? "ring-2 ring-mauve-900 scale-110" : "ring-1 ring-line hover:scale-105"}`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}
            <div className="flex items-center gap-2 rounded-full border border-line-strong bg-ivory pl-1 pr-3 h-10">
              <input
                type="color"
                value={form.brandColor ?? salon.brandColor}
                onChange={(e) => update("brandColor", e.target.value.toUpperCase())}
                className="h-8 w-8 rounded-full cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={form.brandColor ?? salon.brandColor}
                onChange={(e) => update("brandColor", e.target.value.toUpperCase())}
                maxLength={9}
                className="w-20 bg-transparent text-xs font-mono text-mauve-900 outline-none"
                placeholder="#D89888"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Datos del salón</h2>
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
