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
                  <tr key={s.id} className="hover:bg-cream/40 transition-colors">
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
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-xl p-6 sm:p-7 rounded-b-none sm:rounded-3xl max-h-[92vh] overflow-y-auto"
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
