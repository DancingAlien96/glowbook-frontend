"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { formatDate } from "../../_lib/format";
import type { AdminSalon, SubStatus } from "../../_lib/types";

const STATUS_BADGE: Record<SubStatus, string> = {
  TRIAL: "status-pending",
  ACTIVE: "status-completed",
  OVERDUE: "status-pending",
  SUSPENDED: "status-cancelled",
  CANCELLED: "chip-cream",
  LIFETIME: "chip-gold",
};
const STATUS_LABEL: Record<SubStatus, string> = {
  TRIAL: "Prueba",
  ACTIVE: "Activa",
  OVERDUE: "Vencida",
  SUSPENDED: "Suspendida",
  CANCELLED: "Cancelada",
  LIFETIME: "Lifetime ✦",
};

const ALL_STATUSES: SubStatus[] = ["TRIAL", "ACTIVE", "OVERDUE", "SUSPENDED", "CANCELLED", "LIFETIME"];

export default function AdminSalonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubStatus | "">("");
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (status) p.set("status", status);
    return p.toString();
  }, [search, status]);

  const { data, loading, error, refetch } = useApi<{ salons: AdminSalon[] }>(
    `/admin/salons${query ? `?${query}` : ""}`,
    [query]
  );

  const salons = data?.salons ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Salones</div>
          <h1 className="font-serif text-3xl text-mauve-900 leading-tight">Tus clientas (salones)</h1>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary h-10 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Nueva dueña
        </button>
      </div>

      <div className="card-surface p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o slug…"
            className="input-soft pl-10 h-10"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setStatus("")}
            className={`chip ${!status ? "bg-mauve-900 text-cream" : "chip-cream"} transition`}
          >
            Todos
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s === status ? "" : s)}
              className={`chip ${status === s ? "bg-mauve-900 text-cream" : STATUS_BADGE[s]} transition`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <LoadingBlock label="Cargando salones" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : salons.length === 0 ? (
        <EmptyBlock title="Sin resultados" description="Ningún salón coincide con el filtro." />
      ) : (
        <div className="card-surface p-0 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-cream-soft text-[11px] uppercase tracking-wider text-mauve-400">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Salón</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Plan</th>
                <th className="text-left px-5 py-3 font-medium">Vencimiento</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Equipo · citas</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {salons.map((s) => {
                const sub = s.subscription;
                return (
                  <tr
                    key={s.id}
                    onClick={() => setOpenId(s.id)}
                    className="hover:bg-cream/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif text-sm">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-mauve-900 truncate">{s.name}</div>
                          <div className="text-[10px] text-mauve-400">desde {formatDate(s.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-mauve-500 font-mono hidden md:table-cell">{s.slug}</td>
                    <td className="px-5 py-3.5 text-sm text-mauve-700">
                      {sub?.plan === "LIFETIME" ? "Lifetime" : "Mensual"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-mauve-700">
                      {sub?.status === "LIFETIME"
                        ? "—"
                        : sub?.currentPeriodEnd
                        ? formatDate(sub.currentPeriodEnd)
                        : sub?.trialEndsAt
                        ? `Trial · ${formatDate(sub.trialEndsAt)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-mauve-600 hidden lg:table-cell">
                      {s._count.members} · {s._count.appointments} citas
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`chip ${STATUS_BADGE[sub?.status ?? "TRIAL"]}`}>
                        {STATUS_LABEL[sub?.status ?? "TRIAL"]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <NewSalonModal
          onClose={() => setShowNew(false)}
          onCreated={async () => {
            await refetch();
            setShowNew(false);
          }}
        />
      )}

      {openId && (
        <SalonDetailModal
          salonId={openId}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

// ─── New salon modal ─────────────────────────────────────────────────────
// Creates the salon + owner + subscription in one POST. The slug is auto-
// derived from the salon name (admin can override). A random temp password
// is pre-filled — admin can regenerate or type her own.

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

function randomPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let p = "";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) p += chars[bytes[i]! % chars.length];
  // Sprinkle a symbol so the strength bar in the owner's settings is happy.
  return p + "!2";
}

type NewSalonResponse = {
  salon: { id: string; name: string; slug: string };
  owner: { id: string; name: string; email: string };
};

function NewSalonModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [salonName, setSalonName] = useState("");
  const [salonSlug, setSalonSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [password, setPassword] = useState(() => randomPassword());
  const [plan, setPlan] = useState<"TRIAL" | "LIFETIME">("TRIAL");
  const [sendInvite, setSendInvite] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Auto-derive the slug from the salon name until the admin manually edits it.
  useEffect(() => {
    if (!slugEdited) setSalonSlug(slugify(salonName));
  }, [salonName, slugEdited]);

  const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(salonSlug) && salonSlug.length >= 3;
  const canSubmit =
    ownerName.trim().length >= 2 &&
    /^.+@.+\..+$/.test(ownerEmail) &&
    salonName.trim().length >= 2 &&
    slugValid &&
    password.length >= 8 &&
    !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    try {
      await api<NewSalonResponse>("/admin/salons", {
        method: "POST",
        body: {
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim().toLowerCase(),
          ownerPassword: password,
          salonName: salonName.trim(),
          salonSlug,
          plan,
          sendInvite,
        },
      });
      await onCreated();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "No pudimos crear el salón.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-3 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-xl p-6 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-mauve-400">Nuevo salón</div>
            <h2 className="font-serif text-2xl text-mauve-900 leading-tight">Crear cuenta de dueña</h2>
            <p className="text-xs text-mauve-500 mt-1">
              Se crean salón + cuenta de dueña + suscripción. Recibe un email con sus credenciales.
            </p>
          </div>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* ── Owner ──────────────────────────────────────────────────── */}
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">Dueña</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre completo *" value={ownerName} onChange={setOwnerName} placeholder="Isabella Rosales" />
            <Field label="Email *" type="email" value={ownerEmail} onChange={setOwnerEmail} placeholder="isabella@ejemplo.com" />
          </div>
        </div>

        {/* ── Salon ──────────────────────────────────────────────────── */}
        <div className="mt-4 pt-4 border-t border-line">
          <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">Salón</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre del salón *" value={salonName} onChange={setSalonName} placeholder="Maison Rose Studio" />
            <div>
              <label className="text-[11px] uppercase tracking-wider text-mauve-400">Slug (URL) *</label>
              <div className="mt-1 flex items-stretch rounded-xl border border-line bg-cream overflow-hidden focus-within:border-gold-400 transition">
                <span className="px-3 text-xs text-mauve-400 grid place-items-center bg-cream-soft border-r border-line whitespace-nowrap">/s/</span>
                <input
                  required
                  value={salonSlug}
                  onChange={(e) => { setSlugEdited(true); setSalonSlug(e.target.value.toLowerCase()); }}
                  className="flex-1 h-11 bg-transparent px-3 text-sm text-mauve-900 outline-none font-mono"
                  placeholder="maison-rose"
                />
              </div>
              {salonSlug && !slugValid && (
                <p className="mt-1 text-[11px] text-blush-500">Solo minúsculas, números y guiones. Mín. 3 caracteres.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Password ───────────────────────────────────────────────── */}
        <div className="mt-4 pt-4 border-t border-line">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Contraseña temporal</div>
            <button
              type="button"
              onClick={() => setPassword(randomPassword())}
              className="text-[11px] text-mauve-700 hover:text-mauve-900 underline underline-offset-2"
            >
              Generar otra
            </button>
          </div>
          <input
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl bg-cream border border-line px-3 text-sm text-mauve-900 font-mono tracking-wider"
          />
          <p className="mt-1 text-[11px] text-mauve-400">
            La dueña debería cambiarla apenas entre (Configuración → Cambiar contraseña).
          </p>
        </div>

        {/* ── Plan ───────────────────────────────────────────────────── */}
        <div className="mt-4 pt-4 border-t border-line">
          <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">Plan inicial</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: "TRIAL", title: "Prueba", desc: "Usa los días de prueba configurados en Plataforma." },
              { id: "LIFETIME", title: "Lifetime ✦", desc: "Activa para siempre. Sin vencimiento, sin pagos." },
            ] as const).map((o) => {
              const active = plan === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setPlan(o.id)}
                  className={`text-left p-3 rounded-xl border transition ${
                    active ? "border-mauve-900 bg-mauve-900/5" : "border-line hover:border-mauve-900/30"
                  }`}
                >
                  <div className="text-sm font-medium text-mauve-900">{o.title}</div>
                  <div className="text-[11px] text-mauve-500 mt-0.5 leading-relaxed">{o.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Invite toggle ─────────────────────────────────────────── */}
        <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={sendInvite}
            onChange={(e) => setSendInvite(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-mauve-900"
          />
          <span className="text-xs text-mauve-700 leading-relaxed">
            Enviar email de bienvenida con las credenciales (recomendado).
          </span>
        </label>

        {err && <div className="mt-4 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}

        <div className="mt-5 pt-4 border-t border-line flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost h-11 px-5 text-sm">Cancelar</button>
          <button type="submit" disabled={!canSubmit} className="btn btn-primary h-11 px-5 text-sm disabled:opacity-60">
            {busy ? "Creando…" : "Crear salón"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-mauve-400">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full h-11 rounded-xl bg-cream border border-line px-3 text-sm text-mauve-900 placeholder:text-mauve-400/60 focus:outline-none focus:border-gold-400 transition"
      />
    </div>
  );
}

// ─── Salon detail modal ────────────────────────────────────────────────
// Click a row → fetches the salon's full detail (members + sub + counts).
// Each non-admin member gets a "Resetear contraseña" button; on click the
// backend returns a fresh temp password that we reveal inline (once) so the
// admin can copy it or send it to the owner via WhatsApp.

type Member = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "STYLIST" | "STAFF" | "ADMIN";
  createdAt: string;
  stylist: { id: string; active: boolean; role: string | null } | null;
};

type SalonDetail = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  brandColor: string;
  timezone: string;
  currency: string;
  bankDetails: string | null;
  createdAt: string;
  subscription: {
    plan: "MONTHLY" | "LIFETIME";
    status: SubStatus;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
  } | null;
  members: Member[];
  _count: { appointments: number; services: number; stylists: number; clients: number };
};

function SalonDetailModal({ salonId, onClose }: { salonId: string; onClose: () => void }) {
  const { data, loading, error, refetch } = useApi<{ salon: SalonDetail }>(`/admin/salons/${salonId}`, [salonId]);
  const salon = data?.salon;

  // Map userId → freshly-issued temp password (only kept in memory during this
  // modal lifetime; never sent back to the server again).
  const [resetMap, setResetMap] = useState<Record<string, string>>({});
  const [resetting, setResetting] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const resetPassword = async (m: Member) => {
    if (!confirm(`¿Generar una nueva contraseña para ${m.name}? La actual dejará de funcionar.`)) return;
    setResetting(m.id);
    setErr(null);
    try {
      const { newPassword } = await api<{ newPassword: string }>(`/admin/users/${m.id}/reset-password`, {
        method: "POST",
      });
      setResetMap((m2) => ({ ...m2, [m.id]: newPassword }));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "No pudimos resetear la contraseña.");
    } finally {
      setResetting(null);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text).catch(() => {});

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-3 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-2xl p-6 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Salón</div>
            <h2 className="font-serif text-2xl text-mauve-900 leading-tight truncate">
              {salon?.name ?? "Cargando…"}
            </h2>
            {salon && (
              <p className="text-xs text-mauve-500 mt-1 font-mono truncate">/{salon.slug}</p>
            )}
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {loading && !salon ? (
          <div className="mt-6"><LoadingBlock label="Cargando detalles" /></div>
        ) : error ? (
          <div className="mt-6"><ErrorBlock error={error} onRetry={refetch} /></div>
        ) : !salon ? null : (
          <>
            {/* Subscription + counts strip */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Stat label="Plan" value={salon.subscription?.plan === "LIFETIME" ? "Lifetime ✦" : "Mensual"} />
              <Stat
                label="Estado"
                value={STATUS_LABEL[salon.subscription?.status ?? "TRIAL"]}
                tone={STATUS_BADGE[salon.subscription?.status ?? "TRIAL"]}
              />
              <Stat label="Citas" value={String(salon._count.appointments)} />
              <Stat label="Clientas" value={String(salon._count.clients)} />
            </div>

            {/* Members + reset password */}
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">
                Miembros · {salon.members.length}
              </div>
              <div className="space-y-2">
                {salon.members.map((m) => {
                  const fresh = resetMap[m.id];
                  return (
                    <div key={m.id} className="rounded-xl border border-line bg-cream-soft/60 p-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-mauve-900 truncate">{m.name}</span>
                            <span className={`chip text-[9px] ${m.role === "OWNER" ? "chip-gold" : m.role === "STYLIST" ? "chip-blush" : "chip-cream"}`}>
                              {m.role === "OWNER" ? "Dueña" : m.role === "STYLIST" ? "Estilista" : m.role}
                            </span>
                            {m.stylist && !m.stylist.active && (
                              <span className="chip status-cancelled text-[9px]">Pausada</span>
                            )}
                          </div>
                          <div className="text-[11px] text-mauve-500 font-mono mt-0.5 truncate">{m.email}</div>
                        </div>
                        {m.role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => resetPassword(m)}
                            disabled={resetting === m.id}
                            className="btn btn-ghost h-9 text-[11px] px-3 shrink-0 disabled:opacity-60"
                            title="Generar nueva contraseña"
                          >
                            {resetting === m.id ? "…" : "🔑 Resetear"}
                          </button>
                        )}
                      </div>

                      {fresh && (
                        <div className="mt-3 rounded-lg bg-gold-300/15 border border-gold-400/30 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-gold-600 font-medium mb-1">
                            Contraseña temporal (se muestra una sola vez)
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 min-w-0 text-sm font-mono text-mauve-900 break-all bg-cream rounded-md px-2 py-1.5">
                              {fresh}
                            </code>
                            <button
                              type="button"
                              onClick={() => copy(fresh)}
                              className="btn btn-primary h-9 text-[11px] px-3 shrink-0"
                              title="Copiar contraseña"
                            >
                              Copiar
                            </button>
                          </div>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Hola ${m.name.split(" ")[0]}, tu acceso a Ecodama:\n\nEmail: ${m.email}\nContraseña: ${fresh}\n\nIngresa aquí: ${typeof window !== "undefined" ? window.location.origin : ""}/login\n\nPor favor cámbiala apenas entres (Configuración → Cambiar contraseña).`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-mauve-700 hover:text-mauve-900 underline-offset-2 hover:underline"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6 2 .9 2 .6 2.4.6.4 0 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1z"/></svg>
                            Enviar por WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locale */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 text-xs">
              <InfoRow label="Zona horaria" value={salon.timezone} />
              <InfoRow label="Moneda" value={salon.currency} />
            </div>

            {err && <div className="mt-4 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-cream-soft/70 p-3">
      <div className="text-[10px] uppercase tracking-wider text-mauve-400">{label}</div>
      {tone ? (
        <span className={`chip ${tone} text-[10px] mt-1`}>{value}</span>
      ) : (
        <div className="text-sm font-medium text-mauve-900 mt-1 truncate">{value}</div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-soft/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-mauve-400">{label}</div>
      <div className="text-xs font-mono text-mauve-900 mt-0.5 truncate">{value}</div>
    </div>
  );
}
