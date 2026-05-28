"use client";

import { useMemo, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useAuth } from "../../_lib/auth";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import BlocksManager from "../../_components/dashboard/BlocksManager";
import { money, formatDate, formatTime, initials } from "../../_lib/format";
import { statusChip, statusDot, translateStatus } from "../../_lib/status";
import type { Appointment, AppointmentStatus, BlockedSlot, Service, Stylist } from "../../_lib/types";

const stylistChipTones: Record<number, string> = {
  0: "bg-blush-200/70 text-mauve-900",
  1: "bg-lavender-200/70 text-mauve-900",
  2: "bg-gold-300/50 text-mauve-900",
  3: "bg-nude-200/70 text-mauve-900",
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const day = (r.getDay() + 6) % 7; // Monday=0
  r.setDate(r.getDate() - day);
  return r;
}

function startOfMonth(d: Date) {
  const r = new Date(d.getFullYear(), d.getMonth(), 1);
  r.setHours(0, 0, 0, 0);
  return r;
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function AppointmentsPage() {
  const { user } = useAuth();
  const currency = user?.salon?.currency ?? "USD";

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [stylistFilter, setStylistFilter] = useState<string>("");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showBlocks, setShowBlocks] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // The visible grid is 6 weeks starting on the Monday on/before the 1st.
  const gridStart = useMemo(() => startOfWeek(monthAnchor), [monthAnchor]);
  const gridEnd = useMemo(() => new Date(gridStart.getTime() + 42 * 86_400_000), [gridStart]);

  const stylistsQ = useApi<{ stylists: Stylist[] }>("/stylists");
  const servicesQ = useApi<{ services: Service[] }>("/services");
  const apptsQ = useApi<{ appointments: Appointment[] }>(
    `/appointments?from=${encodeURIComponent(gridStart.toISOString())}&to=${encodeURIComponent(gridEnd.toISOString())}${stylistFilter ? `&stylistId=${stylistFilter}` : ""}`,
    [gridStart.toISOString(), stylistFilter]
  );
  const blocksQ = useApi<{ blocks: BlockedSlot[] }>(
    `/schedules/blocks?from=${encodeURIComponent(gridStart.toISOString())}&to=${encodeURIComponent(gridEnd.toISOString())}`,
    [gridStart.toISOString()]
  );

  const stylists = stylistsQ.data?.stylists ?? [];
  const toneByStylist: Record<string, string> = {};
  stylists.forEach((s, i) => (toneByStylist[s.id] = stylistChipTones[i % 4]!));

  // Map day → block (full-day blocks shade the cell).
  const blockByDay = useMemo(() => {
    const map = new Map<string, BlockedSlot>();
    for (const b of blocksQ.data?.blocks ?? []) {
      // Mark every day the block spans.
      const start = new Date(b.startAt);
      const end = new Date(b.endAt);
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      while (cur < end) {
        map.set(dayKey(cur), b);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [blocksQ.data]);

  // Group appointments by day.
  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of apptsQ.data?.appointments ?? []) {
      const k = dayKey(new Date(a.startAt));
      const arr = map.get(k) ?? [];
      arr.push(a);
      map.set(k, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
    return map;
  }, [apptsQ.data]);

  const cells = useMemo(
    () => Array.from({ length: 42 }, (_, i) => new Date(gridStart.getTime() + i * 86_400_000)),
    [gridStart]
  );

  const monthLabel = monthAnchor.toLocaleDateString("es-EC", { month: "long", year: "numeric" });
  const todayKey = dayKey(new Date());
  const isCurrentMonth = startOfMonth(new Date()).getTime() === monthAnchor.getTime();
  const goMonth = (delta: number) =>
    setMonthAnchor((m) => startOfMonth(new Date(m.getFullYear(), m.getMonth() + delta, 1)));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Agenda mensual</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Agenda</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNew(true)} className="btn btn-primary h-10 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Nueva cita
          </button>
          <button onClick={() => setShowBlocks(true)} className="btn btn-ghost h-10 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Bloquear fechas
          </button>
          <button onClick={() => goMonth(-1)} aria-label="Mes anterior" className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="h-10 px-4 rounded-full bg-mauve-900/5 flex flex-col items-center justify-center min-w-[150px] leading-none">
            <span className="text-sm font-medium text-mauve-900 capitalize">{monthLabel}</span>
            <span className="text-[10px] text-mauve-400 mt-0.5">{isCurrentMonth ? "Este mes" : "Mes"}</span>
          </div>
          <button onClick={() => goMonth(1)} aria-label="Mes siguiente" className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          {!isCurrentMonth && (
            <button onClick={() => setMonthAnchor(startOfMonth(new Date()))} className="btn btn-ghost h-10 text-xs">Hoy</button>
          )}
        </div>
      </div>

      <div className="card-surface p-4 flex flex-wrap items-center gap-3">
        <span className="text-xs text-mauve-400 uppercase tracking-wider">Estilistas</span>
        <button
          onClick={() => setStylistFilter("")}
          className={`chip ${!stylistFilter ? "bg-mauve-900 text-cream" : "chip-cream"} transition`}
        >
          Todas
        </button>
        {stylists.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStylistFilter(s.id)}
            className={`chip ${stylistFilter === s.id ? "bg-mauve-900 text-cream" : i % 3 === 0 ? "chip-blush" : i % 3 === 1 ? "chip-lavender" : "chip-gold"} transition`}
          >
            {s.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {apptsQ.loading && !apptsQ.data ? (
        <LoadingBlock label="Cargando agenda" />
      ) : apptsQ.error ? (
        <ErrorBlock error={apptsQ.error} onRetry={apptsQ.refetch} />
      ) : (
        <div className="card-surface p-0 overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-line">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider text-mauve-400 border-l border-line first:border-l-0">
                {w}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7">
            {cells.map((date, i) => {
              const k = dayKey(date);
              const inMonth = date.getMonth() === monthAnchor.getMonth();
              const isToday = k === todayKey;
              const block = blockByDay.get(k);
              const dayAppts = byDay.get(k) ?? [];
              const shown = dayAppts.slice(0, 3);
              const extra = dayAppts.length - shown.length;
              const topRow = i < 7;

              return (
                <div
                  key={k}
                  className={`relative min-h-[92px] sm:min-h-[120px] border-l border-line first:border-l-0 p-1.5 ${topRow ? "" : "border-t"} ${
                    inMonth ? "" : "bg-cream-soft/40"
                  } ${isToday ? "bg-blush-100/30" : ""} ${block ? "bg-mauve-900/[0.04]" : ""}`}
                  title={block ? `Bloqueado${block.reason ? ` · ${block.reason}` : ""}` : undefined}
                >
                  {block && (
                    <div className="absolute inset-0 pattern-dots opacity-[0.5] pointer-events-none" />
                  )}
                  <div className="flex items-center justify-between px-1 relative">
                    <span
                      className={`text-xs font-medium grid place-items-center h-6 w-6 rounded-full ${
                        isToday ? "bg-mauve-900 text-cream" : inMonth ? "text-mauve-900" : "text-mauve-400/50"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {block ? (
                      <span className="text-mauve-400" title={block.reason ?? "Bloqueado"}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      </span>
                    ) : dayAppts.length > 0 ? (
                      <span className="text-[9px] text-mauve-400">{dayAppts.length}</span>
                    ) : null}
                  </div>

                  <div className="mt-1 space-y-1">
                    {shown.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelected(a)}
                        className={`w-full text-left rounded-md px-1.5 py-1 flex items-center gap-1 ${toneByStylist[a.stylist?.id ?? ""] ?? "bg-mauve-900/5 text-mauve-900"} hover:brightness-95 transition ${a.status === "CANCELLED" ? "opacity-50 line-through" : ""}`}
                        title={`${formatTime(a.startAt)} · ${a.client.name} · ${a.service.name} · ${translateStatus(a.status)}`}
                      >
                        <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${statusDot(a.status)}`} />
                        <span className="text-[10px] font-medium tabular-nums shrink-0 hidden sm:inline">{formatTime(a.startAt)}</span>
                        <span className="text-[10px] truncate">{a.client.name}</span>
                      </button>
                    ))}
                    {extra > 0 && (
                      <button
                        onClick={() => setSelected(dayAppts[3]!)}
                        className="w-full text-left text-[10px] text-mauve-500 px-1.5 hover:text-mauve-900"
                      >
                        +{extra} más
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <ApptModal
          appt={selected}
          currency={currency}
          onClose={() => setSelected(null)}
          onChanged={async () => {
            await apptsQ.refetch();
            setSelected(null);
          }}
        />
      )}

      {showBlocks && (
        <BlocksManager
          blocks={blocksQ.data?.blocks ?? []}
          stylists={stylists.map((s) => ({ id: s.id, name: s.name }))}
          onClose={() => setShowBlocks(false)}
          onChanged={async () => {
            await blocksQ.refetch();
          }}
        />
      )}

      {showNew && (
        <NewAppointmentModal
          services={(servicesQ.data?.services ?? []).filter((s) => s.active)}
          stylists={stylists.filter((s) => s.active)}
          onClose={() => setShowNew(false)}
          onCreated={async () => {
            await apptsQ.refetch();
            setShowNew(false);
          }}
        />
      )}
    </div>
  );
}

function ApptModal({
  appt,
  currency,
  onClose,
  onChanged,
}: {
  appt: Appointment;
  currency: string;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [acting, setActing] = useState<AppointmentStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const start = new Date(appt.startAt);
  const end = new Date(appt.endAt);
  const phoneDigits = appt.client.phone?.replace(/\D/g, "");
  const payment = appt.payments?.[0];

  const setStatus = async (status: AppointmentStatus) => {
    setActing(status);
    setErr(null);
    try {
      await api(`/appointments/${appt.id}/status`, { method: "PATCH", body: { status } });
      await onChanged();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "No pudimos actualizar la cita.");
      setActing(null);
    }
  };

  // Which status actions to offer based on current status.
  const actions: { status: AppointmentStatus; label: string; variant: string }[] = [];
  if (appt.status === "PENDING") actions.push({ status: "CONFIRMED", label: "Confirmar cita", variant: "btn-primary" });
  if (appt.status === "CONFIRMED") actions.push({ status: "COMPLETED", label: "Marcar completada", variant: "btn-primary" });
  if (appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && appt.status !== "NO_SHOW") {
    actions.push({ status: "NO_SHOW", label: "No asistió", variant: "btn-ghost" });
    actions.push({ status: "CANCELLED", label: "Cancelar", variant: "btn-ghost" });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-lg p-6 sm:p-7 rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-lavender-200 to-lavender-400 grid place-items-center text-mauve-900 font-medium shrink-0">
              {initials(appt.client.name)}
            </div>
            <div className="min-w-0">
              <div className="font-serif text-xl text-mauve-900 leading-tight truncate">{appt.client.name}</div>
              <span className={`chip ${statusChip(appt.status)} text-[10px] mt-1`}>{translateStatus(appt.status)}</span>
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Service hero */}
        <div className="mt-5 rounded-2xl bg-cream-soft border border-line p-4">
          <div className="text-[11px] uppercase tracking-wider text-mauve-400">Servicio</div>
          <div className="font-serif text-lg text-mauve-900 mt-0.5">{appt.service.name}</div>
        </div>

        {/* Details grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Detail label="Fecha" value={formatDate(start)} />
          <Detail label="Hora" value={`${formatTime(start)} – ${formatTime(end)}`} />
          <Detail label="Duración" value={`${appt.durationMin} min`} />
          <Detail label="Estilista" value={appt.stylist?.name ?? "Sin asignar"} />
          <Detail label="Precio servicio" value={money(appt.priceCents, currency)} />
          <Detail label="Anticipo" value={money(appt.depositCents, currency)} />
        </div>

        {payment && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
            <span className="text-sm text-mauve-600">Pago del anticipo</span>
            <span className={`chip ${statusChip(payment.status === "APPROVED" ? "COMPLETED" : payment.status === "REJECTED" ? "CANCELLED" : "PENDING")} text-[10px]`}>
              {payment.status === "APPROVED" ? "Aprobado" : payment.status === "REJECTED" ? "Rechazado" : "Por revisar"}
            </span>
          </div>
        )}

        {appt.notes && (
          <div className="mt-3 rounded-xl bg-cream-soft border border-line p-3">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Notas de la clienta</div>
            <p className="text-sm text-mauve-700 mt-1 leading-relaxed">{appt.notes}</p>
          </div>
        )}

        {/* Contact */}
        {(phoneDigits || appt.client.email) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {phoneDigits && (
              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" className="btn btn-ghost h-10 text-sm flex-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
                WhatsApp
              </a>
            )}
            {appt.client.email && (
              <a href={`mailto:${appt.client.email}`} className="btn btn-ghost h-10 text-sm flex-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                Email
              </a>
            )}
          </div>
        )}

        {err && <div className="mt-4 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}

        {/* Status actions */}
        {actions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-line">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">Cambiar estado</div>
            <div className="flex flex-wrap gap-2">
              {actions.map((act) => (
                <button
                  key={act.status}
                  disabled={!!acting}
                  onClick={() => setStatus(act.status)}
                  className={`btn ${act.variant} h-10 text-sm px-4 disabled:opacity-60 ${act.status === "CANCELLED" ? "text-blush-500" : ""}`}
                >
                  {acting === act.status ? "Guardando…" : act.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-soft/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-mauve-400">{label}</div>
      <div className="text-sm font-medium text-mauve-900 mt-0.5">{value}</div>
    </div>
  );
}

// ─── Quick-add appointment (walk-in / phone) ───────────────────────────────
// Owner-side booking: skips the deposit flow (client pays in person) and
// lands the appointment as CONFIRMED right away. Server still enforces
// conflicts, business hours and stylist availability.
function NewAppointmentModal({
  services,
  stylists,
  onClose,
  onCreated,
}: {
  services: Service[];
  stylists: Stylist[];
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [serviceId, setServiceId] = useState<string>("");
  const [stylistId, setStylistId] = useState<string>("");
  const [date, setDate] = useState<string>(defaultDate);
  const [time, setTime] = useState<string>("10:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === serviceId);

  // If the chosen service is restricted to specific stylists, only show those.
  const eligibleStylists = useMemo(() => {
    if (!selectedService?.stylists?.length) return stylists;
    const ids = new Set(selectedService.stylists.map((x) => x.stylistId));
    return stylists.filter((s) => ids.has(s.id));
  }, [selectedService, stylists]);

  const canSubmit = serviceId && date && /^\d{2}:\d{2}$/.test(time) && name.trim().length >= 2 && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      const [hh, mm] = time.split(":").map(Number);
      const [y, m, d] = date.split("-").map(Number);
      const start = new Date(y!, (m ?? 1) - 1, d!, hh ?? 0, mm ?? 0, 0, 0);
      if (Number.isNaN(start.getTime())) throw new Error("Fecha u hora inválida.");

      await api("/appointments", {
        method: "POST",
        body: {
          serviceId,
          stylistId: stylistId || null,
          startAt: start.toISOString(),
          notes: notes.trim() || null,
          client: {
            name: name.trim(),
            phone: phone.trim() || null,
            email: email.trim() || null,
          },
        },
      });
      await onCreated();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "No pudimos crear la cita.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-lg p-6 sm:p-7 rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-mauve-400">Agendar manualmente</div>
            <h2 className="font-serif text-2xl text-mauve-900 leading-tight">Nueva cita</h2>
            <p className="text-xs text-mauve-500 mt-1">Para reservas por teléfono o walk-in. Queda confirmada al instante.</p>
          </div>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-mauve-400">Servicio *</label>
            <select
              required
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900"
            >
              <option value="">Selecciona un servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.durationMin} min
                </option>
              ))}
            </select>
            {services.length === 0 && (
              <p className="text-[11px] text-blush-500 mt-1">No hay servicios activos. Crea uno en la sección Servicios.</p>
            )}
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-mauve-400">Estilista</label>
            <select
              value={stylistId}
              onChange={(e) => setStylistId(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900"
            >
              <option value="">Sin asignar</option>
              {eligibleStylists.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mauve-400">Fecha *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mauve-400">Hora *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-line">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">Clienta</div>
            <div className="space-y-3">
              <input
                required
                minLength={2}
                placeholder="Nombre completo *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900 placeholder:text-mauve-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900 placeholder:text-mauve-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border border-line bg-cream px-3 text-sm text-mauve-900 placeholder:text-mauve-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-mauve-400">Notas</label>
            <textarea
              rows={2}
              placeholder="Detalles, preferencias…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm text-mauve-900 placeholder:text-mauve-400 resize-none"
            />
          </div>
        </div>

        {err && <div className="mt-4 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}

        <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-line">
          <button type="button" onClick={onClose} className="btn btn-ghost h-11 px-5 text-sm">Cancelar</button>
          <button type="submit" disabled={!canSubmit} className="btn btn-primary h-11 px-5 text-sm disabled:opacity-60">
            {submitting ? "Guardando…" : "Crear cita"}
          </button>
        </div>
      </form>
    </div>
  );
}
