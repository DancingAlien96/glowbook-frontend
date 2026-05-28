"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "../shared/Logo";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useUploadThing } from "../../_lib/uploadthing";
import { optimizeImage, formatBytes } from "../../_lib/imageOptimize";
import { money, initials } from "../../_lib/format";
import { LoadingBlock, ErrorBlock } from "../dashboard/States";
import ShareSalonModal from "./ShareSalonModal";

type PublicSalon = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  coverImageUrl: string | null;
  brandColor: string;
  currency: string;
  depositMode: "NONE" | "PERCENTAGE" | "FULL";
  depositPercent: number;
  bankDetails: string | null;
  services: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    durationMin: number;
    priceCents: number;
  }[];
  stylists: { id: string; name: string; role: string | null }[];
  businessHours: { dayOfWeek: number; openMin: number; closeMin: number }[];
};

type Availability = {
  businessHours: { dayOfWeek: number; openMin: number; closeMin: number }[];
  busy: { startAt: string; endAt: string; stylistId: string | null }[];
  blocked: { startAt: string; endAt: string; stylistId: string | null }[];
};

const STEPS = ["Servicio", "Fecha & hora", "Tus datos", "Pago", "Listo"];
const STYLIST_TONES = ["from-blush-300 to-blush-500", "from-lavender-200 to-lavender-400", "from-gold-300 to-gold-500", "from-nude-200 to-nude-300"];

export default function BookingFlow({ salonSlug }: { salonSlug: string }) {
  const salonQ = useApi<{ salon: PublicSalon }>(`/public/salons/${salonSlug}`);
  const salon = salonQ.data?.salon;

  if (salonQ.loading) {
    return (
      <FlowShell>
        <LoadingBlock label="Cargando salón" />
      </FlowShell>
    );
  }
  if (salonQ.error || !salon) {
    return (
      <FlowShell>
        <ErrorBlock
          error={salonQ.error ?? new ApiError(404, "Salón no encontrado")}
          onRetry={salonQ.refetch}
        />
      </FlowShell>
    );
  }

  return <Flow salon={salon} />;
}

function FlowShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-aurora-soft">
      <header className="border-b border-line bg-cream/70 backdrop-blur-xl">
        <div className="container-tight h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-14 w-auto" />
          </Link>
        </div>
      </header>
      <div className="container-tight py-10">{children}</div>
    </div>
  );
}

function Flow({ salon }: { salon: PublicSalon }) {
  const [step, setStep] = useState(0);
  const [activeCat, setActiveCat] = useState("Todos");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [stylistId, setStylistId] = useState<string>(""); // "" = cualquiera
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null); // "HH:MM"
  const [client, setClient] = useState({ name: "", email: "", phone: "", notes: "" });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  // Share sheet trigger — small button overlaid on the salon hero so visitors
  // can pass the page to a friend without copying the URL by hand.
  const [shareOpen, setShareOpen] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<string | null>(null);
  const [optimizingReceipt, setOptimizingReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{ id: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePickReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) {
      setReceiptFile(null);
      setReceiptInfo(null);
      return;
    }
    setSubmitError(null);
    setOptimizingReceipt(true);
    const { file, originalBytes, optimized } = await optimizeImage(picked, { maxMB: 3, maxDim: 2000 });
    setOptimizingReceipt(false);
    setReceiptFile(file);
    setReceiptInfo(
      optimized
        ? `Optimizada de ${formatBytes(originalBytes)} a ${formatBytes(file.size)} ✦`
        : `${formatBytes(file.size)} listo`
    );
  };

  const service = useMemo(() => salon.services.find((s) => s.id === serviceId) ?? null, [salon.services, serviceId]);

  const stylist = useMemo(() => salon.stylists.find((s) => s.id === stylistId) ?? null, [salon.stylists, stylistId]);

  // Availability for the picked week (load when service + date selected)
  const availabilityPath = useMemo(() => {
    if (!date) return null;
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 86_400_000);
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    if (stylistId) params.set("stylistId", stylistId);
    return `/public/salons/${salon.slug}/availability?${params.toString()}`;
  }, [date, stylistId, salon.slug]);

  const availabilityQ = useApi<Availability>(availabilityPath, [availabilityPath ?? ""]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    salon.services.forEach((s) => cats.add(s.category ?? "Otros"));
    return ["Todos", ...Array.from(cats)];
  }, [salon.services]);

  const visibleServices = activeCat === "Todos" ? salon.services : salon.services.filter((s) => (s.category ?? "Otros") === activeCat);

  const slots = useMemo(() => {
    if (!service || !date) return [] as string[];
    const dow = date.getDay();
    const hours = (availabilityQ.data?.businessHours ?? salon.businessHours).find((h) => h.dayOfWeek === dow);
    if (!hours) return [];

    const result: string[] = [];
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const slotStep = 30; // minutes
    for (let m = hours.openMin; m + service.durationMin <= hours.closeMin; m += slotStep) {
      const slotStart = new Date(dayStart.getTime() + m * 60_000);
      const slotEnd = new Date(slotStart.getTime() + service.durationMin * 60_000);
      const isPast = slotStart.getTime() < Date.now() + 60_000;

      const busy = (availabilityQ.data?.busy ?? []).some((b) => {
        if (stylistId && b.stylistId && b.stylistId !== stylistId) return false;
        return new Date(b.startAt) < slotEnd && new Date(b.endAt) > slotStart;
      });
      const blocked = (availabilityQ.data?.blocked ?? []).some(
        (b) => new Date(b.startAt) < slotEnd && new Date(b.endAt) > slotStart
      );

      if (!isPast && !busy && !blocked) {
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        result.push(`${hh}:${mm}`);
      }
    }
    return result;
  }, [service, date, availabilityQ.data, salon.businessHours, stylistId]);

  const deposit =
    !service
      ? 0
      : salon.depositMode === "FULL"
      ? service.priceCents
      : salon.depositMode === "PERCENTAGE"
      ? Math.round((service.priceCents * salon.depositPercent) / 100)
      : 0;

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!date && !!time) ||
    (step === 2 && client.name.trim().length > 1 && /\S+@\S+\.\S+/.test(client.email)) ||
    (step === 3 && (salon.depositMode === "NONE" || !!receiptFile)) ||
    step === 4;

  // UploadThing — imperative uploader. We pass appointmentId once we have it.
  const { startUpload, isUploading } = useUploadThing("receiptUploader", {
    onUploadError: (e) => setSubmitError(e.message || "No pudimos subir el comprobante."),
  });

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (step === 3) {
      // Submit booking
      if (!service || !date || !time) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const [hh, mm] = time.split(":").map(Number);
        const start = new Date(date);
        start.setHours(hh!, mm!, 0, 0);

        const { appointment } = await api<{ appointment: { id: string } }>(
          `/public/salons/${salon.slug}/bookings`,
          {
            method: "POST",
            auth: false,
            body: {
              serviceId: service.id,
              stylistId: stylistId || null,
              startAt: start.toISOString(),
              notes: client.notes || null,
              client: {
                name: client.name,
                email: client.email,
                phone: client.phone || null,
              },
            },
          }
        );

        if (receiptFile && salon.depositMode !== "NONE") {
          // 1) Upload to UploadThing with the appointmentId as metadata.
          const uploaded = await startUpload([receiptFile], { appointmentId: appointment.id });
          const file = uploaded?.[0];
          if (!file) throw new Error("La subida fue cancelada.");

          // 2) Register the URL with our API so the dueña ve el comprobante.
          await api(`/public/payments/${appointment.id}/receipt`, {
            method: "POST",
            auth: false,
            body: { url: file.ufsUrl, name: file.name },
          });
        }

        setBookingResult({ id: appointment.id });
        setStep(4);
      } catch (e) {
        setSubmitError(e instanceof ApiError ? e.message : "No pudimos crear tu reserva.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Expose the salon's brand color as a CSS variable so we can tint accents.
  const brandVars = { "--brand": salon.brandColor } as React.CSSProperties;

  return (
    <FlowShell>
      <div style={brandVars}>
      {/* Salon hero */}
      {salon.coverImageUrl ? (
        <div className="relative max-w-5xl mx-auto mb-8 rounded-[2rem] overflow-hidden border border-line shadow-[var(--shadow-soft)]">
          <div
            className="aspect-[3/1] sm:aspect-[16/5] bg-mauve-900/10"
            style={{ backgroundImage: `url(${salon.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mauve-900/85 via-mauve-900/30 to-transparent" />

          {/* Floating share button — top-right of the hero */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Compartir este salón"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 h-10 px-3 sm:px-4 rounded-full bg-cream/90 backdrop-blur text-mauve-900 text-xs font-medium inline-flex items-center gap-1.5 hover:bg-cream transition shadow-[var(--shadow-soft)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
            Compartir
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex items-end gap-4">
            <div
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl grid place-items-center text-cream font-serif text-2xl ring-2 ring-cream/40 shrink-0"
              style={{ backgroundColor: salon.brandColor }}
            >
              {initials(salon.name)}
            </div>
            <div className="text-cream min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-cream/80">Reservar en</div>
              <h1 className="font-serif text-2xl sm:text-4xl leading-tight break-words">{salon.name}</h1>
              {salon.tagline && (
                <p className="text-cream/90 text-sm sm:text-base mt-1 max-w-xl text-pretty">{salon.tagline}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center max-w-2xl mx-auto mb-10 relative">
          {/* Share button — top-right corner, same affordance as the cover hero */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Compartir este salón"
            className="absolute top-0 right-0 h-9 px-3 rounded-full bg-mauve-900/5 text-mauve-700 hover:bg-mauve-900/10 text-xs font-medium inline-flex items-center gap-1.5 transition"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
            Compartir
          </button>

          <div className="inline-flex items-center gap-3">
            <div
              className="h-14 w-14 rounded-2xl grid place-items-center text-cream font-serif text-2xl"
              style={{ backgroundColor: salon.brandColor }}
            >
              {initials(salon.name)}
            </div>
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-wider text-mauve-400">Reservar en</div>
              <h1 className="font-serif text-2xl text-mauve-900 leading-tight break-words">{salon.name}</h1>
              {salon.tagline && <p className="text-mauve-600 text-sm mt-0.5">{salon.tagline}</p>}
            </div>
          </div>
          {salon.description && <p className="mt-4 text-mauve-600 text-pretty">{salon.description}</p>}
        </div>
      )}
      {salon.coverImageUrl && salon.description && (
        <p className="text-center max-w-2xl mx-auto mb-8 text-mauve-600 text-pretty">{salon.description}</p>
      )}

      <ol className="mx-auto max-w-3xl mb-8 grid grid-cols-5 gap-1.5">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s} className="flex flex-col items-center gap-1.5">
              <div className={`h-1.5 w-full rounded-full transition-all ${done ? "bg-mauve-900" : active ? "bg-gradient-to-r from-mauve-900 to-mauve-800/30" : "bg-mauve-900/10"}`} />
              {/* Hide step labels on small screens — they don't fit in 5 columns
                  on a 360px viewport. Active step gets a centered label below
                  the whole stepper instead. */}
              <span className={`hidden sm:inline text-xs ${active ? "text-mauve-900 font-medium" : "text-mauve-400"}`}>{s}</span>
            </li>
          );
        })}
      </ol>
      <div className="sm:hidden -mt-6 mb-8 text-center text-xs text-mauve-900 font-medium">
        Paso {step + 1} de {STEPS.length} · {STEPS[step]}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 max-w-5xl mx-auto">
        <div className="card-elevated p-6 sm:p-8 min-h-[500px]">
          {/* Step 0: services */}
          {step === 0 && (
            <>
              <h2 className="font-serif text-2xl text-mauve-900">Elige tu servicio</h2>
              <p className="text-sm text-mauve-600 mt-1">Cada cita es una experiencia.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`chip ${activeCat === c ? "bg-mauve-900 text-cream" : "chip-cream"} transition`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {visibleServices.length === 0 ? (
                <div className="mt-8 text-sm text-mauve-500 text-center">Este salón aún no tiene servicios activos.</div>
              ) : (
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {visibleServices.map((s) => {
                    const selected = s.id === serviceId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setServiceId(s.id)}
                        className={`text-left rounded-2xl border-2 p-4 transition-all ${selected ? "border-mauve-900 bg-cream-soft" : "border-line bg-ivory hover:border-line-strong"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blush-200 to-blush-300 grid place-items-center shrink-0">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-mauve-900" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-serif text-lg text-mauve-900 leading-snug">{s.name}</div>
                              <span className="font-serif text-base text-gold-600 shrink-0">{money(s.priceCents, salon.currency)}</span>
                            </div>
                            {s.description && <p className="text-xs text-mauve-600 mt-1 line-clamp-2">{s.description}</p>}
                            <div className="mt-2 text-[11px] text-mauve-400">{s.durationMin} min · {s.category ?? "Servicio"}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Step 1: stylist + date + time */}
          {step === 1 && (
            <>
              <h2 className="font-serif text-2xl text-mauve-900">Estilista, fecha y hora</h2>
              <p className="text-sm text-mauve-600 mt-1">Elige a quién te atiende y cuándo.</p>

              <div className="mt-5">
                <div className="text-xs uppercase tracking-wider text-mauve-400 mb-2">Estilista</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setStylistId("")}
                    className={`text-center rounded-2xl border-2 p-3 transition ${!stylistId ? "border-mauve-900 bg-cream-soft" : "border-line bg-ivory hover:border-line-strong"}`}
                  >
                    <div className="h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-mauve-800 to-mauve-900 grid place-items-center text-cream font-serif">★</div>
                    <div className="mt-2 text-xs font-medium text-mauve-900 leading-tight">Cualquiera</div>
                    <div className="text-[10px] text-mauve-400 mt-0.5">Te asignamos</div>
                  </button>
                  {salon.stylists.map((s, i) => {
                    const sel = s.id === stylistId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setStylistId(s.id)}
                        className={`text-center rounded-2xl border-2 p-3 transition ${sel ? "border-mauve-900 bg-cream-soft" : "border-line bg-ivory hover:border-line-strong"}`}
                      >
                        <div className={`h-12 w-12 mx-auto rounded-full bg-gradient-to-br ${STYLIST_TONES[i % STYLIST_TONES.length]} grid place-items-center text-cream font-serif`}>{s.name[0]}</div>
                        <div className="mt-2 text-xs font-medium text-mauve-900 leading-tight truncate">{s.name.split(" ")[0]}</div>
                        {s.role && <div className="text-[10px] text-mauve-400 mt-0.5 line-clamp-1">{s.role}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-[1.2fr_1fr] gap-5">
                <DatePicker selected={date} onChange={setDate} />

                <div>
                  <div className="text-xs uppercase tracking-wider text-mauve-400 mb-2">Hora disponible</div>
                  {!date ? (
                    <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center text-xs text-mauve-400">
                      Elige una fecha primero
                    </div>
                  ) : availabilityQ.loading ? (
                    <div className="rounded-2xl border border-line p-6 text-center text-xs text-mauve-400">Cargando…</div>
                  ) : slots.length === 0 ? (
                    <div className="rounded-2xl border border-line p-6 text-center text-xs text-mauve-500">
                      Sin horarios disponibles este día.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                      {slots.map((t) => {
                        const sel = t === time;
                        return (
                          <button
                            key={t}
                            onClick={() => setTime(t)}
                            className={`h-10 rounded-xl text-xs font-medium transition ${sel ? "bg-mauve-900 text-cream" : "bg-mauve-900/5 text-mauve-700 hover:bg-mauve-900/10"}`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 2: client */}
          {step === 2 && (
            <>
              <h2 className="font-serif text-2xl text-mauve-900">Tus datos</h2>
              <p className="text-sm text-mauve-600 mt-1">Para confirmarte la cita y enviarte recordatorios.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre completo</label>
                  <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className="input-soft mt-1.5" placeholder="Ej. Catalina Ríos" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-mauve-400">Email</label>
                    <input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className="input-soft mt-1.5" placeholder="tu@email.com" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-mauve-400">WhatsApp</label>
                    <input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className="input-soft mt-1.5" placeholder="+593 99 ..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-mauve-400">Notas (opcional)</label>
                  <textarea
                    value={client.notes}
                    onChange={(e) => setClient({ ...client, notes: e.target.value })}
                    rows={3}
                    placeholder="Alergias, preferencias, referencia visual…"
                    className="input-soft mt-1.5 h-auto py-3 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: payment */}
          {step === 3 && (
            <>
              {salon.depositMode === "NONE" ? (
                <>
                  <h2 className="font-serif text-2xl text-mauve-900">Confirma tu reserva</h2>
                  <p className="text-sm text-mauve-600 mt-1">No requerimos anticipo. Llega a tiempo el día de tu cita ✦</p>
                </>
              ) : (
                <>
                  <h2 className="font-serif text-2xl text-mauve-900">Asegura tu cita con un anticipo</h2>
                  <p className="text-sm text-mauve-600 mt-1">
                    {salon.depositMode === "FULL"
                      ? "Pago completo por adelantado."
                      : `Anticipo del ${salon.depositPercent}% para confirmar tu reserva.`}{" "}
                    El pago se realiza por <span className="font-medium text-mauve-900">transferencia bancaria</span>.
                  </p>

                  <div className="mt-5 space-y-4">
                    {salon.bankDetails ? (
                      <div className="rounded-2xl bg-cream-soft p-4 border border-line">
                        <div className="text-xs uppercase tracking-wider text-mauve-400">Datos para transferir</div>
                        <pre className="mt-2 text-sm text-mauve-900 font-mono whitespace-pre-wrap break-words leading-relaxed">{salon.bankDetails}</pre>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-blush-100/40 p-4 border border-blush-300/30 text-sm text-mauve-700">
                        El salón aún no ha publicado sus datos bancarios. Contáctalo directamente para coordinar el anticipo.
                      </div>
                    )}

                    <label className="block">
                      <div className="text-xs uppercase tracking-wider text-mauve-400 mb-2">Sube tu comprobante</div>
                      <div className="rounded-2xl border-2 border-dashed border-line-strong bg-ivory hover:border-mauve-900/30 hover:bg-cream-soft transition cursor-pointer p-6 text-center">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handlePickReceipt}
                          disabled={optimizingReceipt}
                        />
                        <div className="h-12 w-12 rounded-full bg-mauve-900/5 grid place-items-center mx-auto">
                          {optimizingReceipt ? (
                            <span className="h-4 w-4 rounded-full border-2 border-mauve-900/30 border-t-mauve-900 animate-spin" />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                          )}
                        </div>
                        <div className="mt-3 text-sm font-medium text-mauve-900">
                          {optimizingReceipt
                            ? "Optimizando tu imagen…"
                            : receiptFile
                            ? "Comprobante listo ✓"
                            : "Toca para subir tu captura"}
                        </div>
                        <div className="text-xs text-mauve-400 mt-1">
                          {receiptInfo ?? receiptFile?.name ?? "Si pasa el límite la optimizamos por ti · PNG, JPG, PDF"}
                        </div>
                      </div>
                    </label>
                  </div>
                </>
              )}

              {submitError && (
                <div className="mt-5 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">
                  {submitError}
                </div>
              )}
            </>
          )}

          {/* Step 4: success */}
          {step === 4 && bookingResult && (
            <div className="text-center py-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 grid place-items-center text-mauve-900 shadow-[var(--shadow-glow-gold)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="mt-5 font-serif text-3xl text-mauve-900">¡Tu cita está casi lista!</h2>
              <p className="mt-2 text-mauve-600 max-w-md mx-auto">
                {salon.depositMode !== "NONE"
                  ? `Recibimos tu comprobante. ${salon.name} lo validará y te enviaremos la confirmación.`
                  : `Te enviamos los detalles a ${client.email}.`}
              </p>

              <div className="mt-7 max-w-sm mx-auto card-surface p-5 text-left">
                <div className="text-[11px] uppercase tracking-wider text-mauve-400">Resumen</div>
                <div className="mt-2 font-serif text-xl text-mauve-900">{service?.name}</div>
                <div className="text-xs text-mauve-600 mt-1">
                  {stylist?.name ?? "Estilista por asignar"} · {date?.toLocaleDateString("es-EC", { day: "numeric", month: "short" })} · {time}
                </div>
                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-sm text-mauve-600">{salon.depositMode === "FULL" ? "Pagado" : "Anticipo"}</span>
                  <span className="font-serif text-lg text-mauve-900">{money(deposit, salon.currency)}</span>
                </div>
                <div className="mt-2 text-[10px] text-mauve-400 font-mono">Ref: {bookingResult.id.slice(0, 12)}</div>
              </div>

              <Link href="/" className="btn btn-primary h-11 px-6 mt-7 inline-flex">
                Volver al inicio
              </Link>
            </div>
          )}

          {step < 4 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
                className="btn btn-ghost h-11 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Atrás
              </button>
              <button
                onClick={handleNext}
                disabled={!canNext || submitting || isUploading}
                className="btn btn-primary h-11 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? "Subiendo comprobante…"
                  : submitting
                  ? "Confirmando…"
                  : step === 3
                  ? "Confirmar reserva"
                  : "Continuar"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="card-elevated p-6 h-fit lg:sticky lg:top-6">
          <div className="text-xs uppercase tracking-wider text-mauve-400">Tu reserva</div>
          <div className="mt-3 space-y-3 text-sm">
            <Row label="Servicio" value={service?.name ?? "—"} />
            <Row label="Estilista" value={stylist?.name ?? "Cualquiera disponible"} />
            <Row label="Fecha" value={date ? date.toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" }) : "—"} />
            <Row label="Hora" value={time ?? "—"} />
            <Row label="Duración" value={service ? `${service.durationMin} min` : "—"} />
          </div>

          <div className="mt-5 pt-5 border-t border-line space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mauve-600">Total servicio</span>
              <span className="text-mauve-900 font-medium">{service ? money(service.priceCents, salon.currency) : "—"}</span>
            </div>
            {salon.depositMode !== "NONE" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-mauve-600">
                  {salon.depositMode === "FULL" ? "Pago total" : `Anticipo (${salon.depositPercent}%)`}
                </span>
                <span className="font-serif text-2xl text-gold-shimmer">{service ? money(deposit, salon.currency) : "—"}</span>
              </div>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-line">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Política</div>
            <p className="mt-1 text-xs text-mauve-600 leading-relaxed">
              Cancelaciones con +24h reciben reembolso completo. No-shows pierden el anticipo.
            </p>
          </div>
        </aside>
      </div>
      </div>

      {shareOpen && (
        <ShareSalonModal
          url={typeof window !== "undefined" ? `${window.location.origin}/book/${salon.slug}` : ""}
          salonName={salon.name}
          onClose={() => setShareOpen(false)}
        />
      )}
    </FlowShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-mauve-400">{label}</span>
      <span className="text-mauve-900 font-medium text-right">{value}</span>
    </div>
  );
}

function DatePicker({ selected, onChange }: { selected: Date | null; onChange: (d: Date) => void }) {
  const [view, setView] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const monthLabel = view.toLocaleDateString("es-EC", { month: "long", year: "numeric" });
  const firstDow = (new Date(view.getFullYear(), view.getMonth(), 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wider text-mauve-400">Fecha · {monthLabel}</div>
        <div className="flex gap-1">
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="h-7 w-7 rounded-full bg-mauve-900/5 grid place-items-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="h-7 w-7 rounded-full bg-mauve-900/5 grid place-items-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-line p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-mauve-400 mb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDow }).map((_, i) => <div key={`pad-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const cell = new Date(view.getFullYear(), view.getMonth(), day);
            const past = cell < today;
            const sel = selected && cell.toDateString() === selected.toDateString();
            return (
              <button
                key={day}
                disabled={past}
                onClick={() => onChange(cell)}
                className={`aspect-square rounded-lg text-xs grid place-items-center transition ${
                  sel
                    ? "bg-mauve-900 text-cream font-medium shadow-md"
                    : past
                    ? "text-mauve-400/40 cursor-not-allowed"
                    : "text-mauve-700 hover:bg-mauve-900/5"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
