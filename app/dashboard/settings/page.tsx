"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useUploadThing } from "../../_lib/uploadthing";
import { optimizeImage, formatBytes } from "../../_lib/imageOptimize";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import BusinessHoursEditor from "../../_components/dashboard/BusinessHoursEditor";
import LocationPicker from "../../_components/dashboard/LocationPicker";
import AppSettings from "../../_components/dashboard/AppSettings";
import ChangePasswordCard from "../../_components/auth/ChangePasswordCard";
import { startOnboarding } from "../../_lib/onboardingTour";
import { SUPPORT_MESSAGES, SUPPORT_WHATSAPP_DISPLAY, whatsappHref } from "../../_lib/support";
import { initials } from "../../_lib/format";
import { withCurrency, withTimezone } from "../../_lib/locales";
import type { DepositMode, Salon, SalonPhoto, Testimonial } from "../../_lib/types";

const COLOR_SWATCHES = [
  { name: "Coral", hex: "#E59078" },
  { name: "Terracota", hex: "#CE6850" },
  { name: "Cobre", hex: "#A8442F" },
  { name: "Violeta", hex: "#7951A4" },
  { name: "Oro miel", hex: "#CB923D" },
  { name: "Oro antiguo", hex: "#9E6E22" },
  { name: "Sage", hex: "#7E9774" },
  { name: "Mauve", hex: "#503842" },
  { name: "Carbón", hex: "#1F0F15" },
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

  // Portfolio gallery — same UploadThing-then-save pattern as the cover,
  // but multiple files and each one persisted as its own SalonPhoto row.
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [optimizingGallery, setOptimizingGallery] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const { startUpload: startGalleryUpload, isUploading: isUploadingGallery } = useUploadThing("galleryUploader", {
    onUploadError: (e) => setGalleryError(e.message || "No pudimos subir las fotos."),
  });

  const onPickGalleryPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (picked.length === 0) return;
    setGalleryError(null);

    const existing = data?.salon.photos?.length ?? 0;
    const room = 24 - existing;
    if (room <= 0) {
      setGalleryError("Ya alcanzaste el máximo de 24 fotos en la galería.");
      return;
    }
    const toUpload = picked.slice(0, room);

    setOptimizingGallery(true);
    const optimized = await Promise.all(
      toUpload.map((f) => optimizeImage(f, { maxMB: 3, maxDim: 2000 }))
    );
    setOptimizingGallery(false);

    const uploaded = await startGalleryUpload(optimized.map((o) => o.file));
    if (!uploaded) return;
    try {
      for (const file of uploaded) {
        await api("/salon/me/photos", { method: "POST", body: { url: file.ufsUrl } });
      }
      await refetch();
    } catch (err) {
      setGalleryError(err instanceof ApiError ? err.message : "Error al guardar las fotos.");
    }
  };

  const onDeletePhoto = async (photo: SalonPhoto) => {
    if (!confirm("¿Quitar esta foto de la galería?")) return;
    setDeletingPhotoId(photo.id);
    try {
      await api(`/salon/me/photos/${photo.id}`, { method: "DELETE" });
      await refetch();
    } catch (err) {
      setGalleryError(err instanceof ApiError ? err.message : "No pudimos quitar la foto.");
    } finally {
      setDeletingPhotoId(null);
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
          aboutText: form.aboutText ?? null,
          instagramUrl: form.instagramUrl || null,
          facebookUrl: form.facebookUrl || null,
          whatsappContact: form.whatsappContact || null,
          address: form.address ?? null,
          latitude: form.latitude ?? null,
          longitude: form.longitude ?? null,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
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
                placeholder="#CE6850"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <div>
          <h2 className="font-serif text-xl text-mauve-900">Galería de trabajos</h2>
          <p className="text-sm text-mauve-600 mt-1">
            Fotos que muestran tu trabajo en tu página pública — lo que más convence a una clienta nueva. Hasta 24 fotos.
          </p>
        </div>

        {(data?.salon.photos?.length ?? 0) > 0 && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data!.salon.photos!.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-line bg-cream-soft group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onDeletePhoto(photo)}
                  disabled={deletingPhotoId === photo.id}
                  className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-mauve-900/60 text-cream backdrop-blur-sm opacity-0 group-hover:opacity-100 transition disabled:opacity-100"
                  title="Quitar foto"
                >
                  {deletingPhotoId === photo.id ? (
                    <span className="h-3 w-3 rounded-full border-2 border-cream/40 border-t-cream animate-spin" />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="btn btn-ghost h-10 text-sm cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickGalleryPhotos}
              disabled={isUploadingGallery || optimizingGallery}
            />
            {optimizingGallery ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-mauve-900/30 border-t-mauve-900 animate-spin" />
                Optimizando…
              </>
            ) : isUploadingGallery ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-mauve-900/30 border-t-mauve-900 animate-spin" />
                Subiendo…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                Agregar fotos
              </>
            )}
          </label>
          <span className="text-xs text-mauve-400">Puedes elegir varias a la vez · JPG o PNG</span>
        </div>

        {galleryError && (
          <div className="mt-3 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">
            {galleryError}
          </div>
        )}
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Quiénes somos</h2>
        <p className="text-sm text-mauve-600 mt-1">Cuenta la historia o filosofía de tu salón — aparece en tu página pública, debajo de la galería.</p>
        <textarea
          rows={5}
          maxLength={4000}
          value={form.aboutText ?? ""}
          onChange={(e) => update("aboutText", e.target.value)}
          placeholder="Ej. Somos un equipo apasionado por realzar tu belleza natural desde hace más de 10 años..."
          className="input-soft mt-4 h-auto py-3 resize-none"
        />
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Redes y contacto</h2>
        <p className="text-sm text-mauve-600 mt-1">Se muestran como enlaces en tu página pública. Deja en blanco lo que no uses.</p>
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Instagram</label>
            <input
              type="url"
              value={form.instagramUrl ?? ""}
              onChange={(e) => update("instagramUrl", e.target.value)}
              placeholder="https://instagram.com/tu_salon"
              className="input-soft mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Facebook</label>
            <input
              type="url"
              value={form.facebookUrl ?? ""}
              onChange={(e) => update("facebookUrl", e.target.value)}
              placeholder="https://facebook.com/tu_salon"
              className="input-soft mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">WhatsApp de contacto</label>
            <input
              type="tel"
              value={form.whatsappContact ?? ""}
              onChange={(e) => update("whatsappContact", e.target.value)}
              placeholder="+593 99 123 4567"
              className="input-soft mt-1.5"
            />
            <p className="mt-1 text-[11px] text-mauve-400">Distinto al WhatsApp que dejan tus clientas al reservar — este es el tuyo, para que te escriban directo.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Teléfono de contacto</label>
              <input
                type="tel"
                value={form.contactPhone ?? ""}
                onChange={(e) => update("contactPhone", e.target.value)}
                placeholder="+593 2 123 4567"
                className="input-soft mt-1.5"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Email de contacto</label>
              <input
                type="email"
                value={form.contactEmail ?? ""}
                onChange={(e) => update("contactEmail", e.target.value)}
                placeholder="hola@tusalon.com"
                className="input-soft mt-1.5"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400 mb-1.5 block">Ubicación</label>
            <LocationPicker
              value={{ address: form.address ?? null, latitude: form.latitude ?? null, longitude: form.longitude ?? null }}
              onChange={(v) => setForm((f) => ({ ...f, ...v }))}
            />
          </div>
        </div>
      </section>

      <TestimonialsEditor testimonials={data?.salon.testimonials ?? []} onChanged={refetch} />

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
                <span className="px-3 text-xs text-mauve-400 font-mono">ecodama.online/</span>
                <span className="flex-1 min-w-0 px-2 py-3 text-sm text-mauve-900 font-mono break-all">{salon.slug}</span>
              </div>
              <div className="mt-1 text-[11px] text-mauve-400">El slug no se puede cambiar después de creado.</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Zona horaria</label>
                <select className="input-soft mt-1.5" value={form.timezone ?? salon.timezone} onChange={(e) => update("timezone", e.target.value)}>
                  {withTimezone(form.timezone ?? salon.timezone).map((o) => (
                    <option key={o.tz} value={o.tz}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-mauve-400">Moneda</label>
                <select className="input-soft mt-1.5" value={form.currency ?? salon.currency} onChange={(e) => update("currency", e.target.value)}>
                  {withCurrency(form.currency ?? salon.currency).map((o) => (
                    <option key={o.code} value={o.code}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BusinessHoursEditor businessHours={salon.businessHours} />

      <AppSettings />

      <ChangePasswordCard />

      {/* Replay the first-time onboarding tour — useful when the dueña wants
          to revisit it or after assigning a new device. */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-cream-soft/40 px-4 py-3 gap-3">
        <div className="min-w-0">
          <div className="text-sm text-mauve-900 font-medium">Tour de bienvenida</div>
          <div className="text-xs text-mauve-500">Vuelve a ver la guía rápida de cómo configurar tu salón.</div>
        </div>
        <button
          type="button"
          onClick={() => startOnboarding(salon.name.split(" ")[0])}
          className="btn btn-ghost h-9 text-xs shrink-0"
        >
          🎓 Repetir tour
        </button>
      </div>

      {/* Direct support line — opens WhatsApp with a pre-baked greeting */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-cream-soft/40 px-4 py-3 gap-3">
        <div className="min-w-0">
          <div className="text-sm text-mauve-900 font-medium">Soporte técnico</div>
          <div className="text-xs text-mauve-500">
            ¿Algo no funciona o tienes una duda? Escríbenos por WhatsApp al <span className="font-mono text-mauve-700">{SUPPORT_WHATSAPP_DISPLAY}</span>.
          </div>
        </div>
        <a
          href={whatsappHref(SUPPORT_MESSAGES.general)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary h-9 text-xs shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
          Abrir chat
        </a>
      </div>

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

// ─── Testimonials ───────────────────────────────────────────────────────
// A plain <div>, not nested inside the outer <form> tag's own submission —
// each testimonial saves/deletes immediately via its own button, HTML
// doesn't allow nested <form> elements so this stays independent of the
// "Guardar cambios" button above.
function TestimonialsEditor({
  testimonials,
  onChanged,
}: {
  testimonials: Testimonial[];
  onChanged: () => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [clientName, setClientName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [serviceName, setServiceName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reset = () => {
    setClientName("");
    setText("");
    setRating(5);
    setServiceName("");
  };

  const onAdd = async () => {
    if (clientName.trim().length < 2 || text.trim().length === 0) return;
    setSaving(true);
    setErr(null);
    try {
      await api("/salon/me/testimonials", {
        method: "POST",
        body: { clientName, text, rating, serviceName: serviceName || null },
      });
      reset();
      setAdding(false);
      await onChanged();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Error al guardar el testimonio");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (t: Testimonial) => {
    if (!confirm(`¿Quitar el testimonio de ${t.clientName}?`)) return;
    setDeletingId(t.id);
    try {
      await api(`/salon/me/testimonials/${t.id}`, { method: "DELETE" });
      await onChanged();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "No pudimos quitar el testimonio.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="card-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-mauve-900">Testimonios</h2>
          <p className="text-sm text-mauve-600 mt-1">
            Escribe o pega comentarios reales de tus clientas — aparecen en tu página pública.
          </p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-ghost h-9 text-xs shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
            Agregar testimonio
          </button>
        )}
      </div>

      {testimonials.length > 0 && (
        <div className="mt-5 space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl border border-line bg-ivory p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < t.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={i < t.rating ? "text-gold-500" : "text-mauve-300"}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-mauve-700 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-1.5 text-xs text-mauve-500">
                    {t.clientName}{t.serviceName ? ` · ${t.serviceName}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(t)}
                  disabled={deletingId === t.id}
                  className="h-8 w-8 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-500 hover:bg-blush-100 hover:text-blush-500 transition shrink-0"
                >
                  {deletingId === t.id ? (
                    <span className="h-3 w-3 rounded-full border-2 border-mauve-900/30 border-t-mauve-900 animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="mt-5 rounded-2xl border border-line-strong bg-cream-soft p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre de la clienta</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-soft mt-1.5" placeholder="Ej. María José" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Servicio (opcional)</label>
              <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="input-soft mt-1.5" placeholder="Ej. Coloración" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Testimonio</label>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} className="input-soft mt-1.5 h-auto py-3 resize-none" placeholder="Lo que dijo tu clienta..." />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Calificación</label>
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={n <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={n <= rating ? "text-gold-500" : "text-mauve-300"}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          {err && <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => { setAdding(false); reset(); }} className="btn btn-ghost h-9 text-xs">Cancelar</button>
            <button type="button" onClick={onAdd} disabled={saving} className="btn btn-primary h-9 text-xs disabled:opacity-60">
              {saving ? "Guardando…" : "Guardar testimonio"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
