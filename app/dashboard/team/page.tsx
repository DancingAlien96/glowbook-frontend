"use client";

import { useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import WeeklyHoursEditor from "../../_components/dashboard/WeeklyHoursEditor";
import { initials, formatDate } from "../../_lib/format";
import type { WeekHour } from "../../_lib/types";

type Member = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "STYLIST" | "STAFF" | "ADMIN";
  createdAt: string;
  stylist: {
    id: string;
    role: string | null;
    active: boolean;
    services: { serviceId: string }[];
    hours: WeekHour[];
  } | null;
};

const tones = ["from-blush-300 to-blush-500", "from-lavender-200 to-lavender-400", "from-gold-300 to-gold-500", "from-nude-200 to-nude-300"];

export default function TeamPage() {
  const { data, loading, error, refetch } = useApi<{ members: Member[] }>("/staff");
  const [showNew, setShowNew] = useState(false);
  const [resetFor, setResetFor] = useState<Member | null>(null);
  const [hoursFor, setHoursFor] = useState<Member | null>(null);

  const members = data?.members ?? [];

  const toggleActive = async (m: Member) => {
    if (!m.stylist) return;
    try {
      await api(`/staff/${m.id}`, { method: "PATCH", body: { active: !m.stylist.active } });
      await refetch();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Error");
    }
  };

  const removeMember = async (m: Member) => {
    if (!confirm(`¿Eliminar el acceso de ${m.name}? Esta acción no borra sus citas pasadas.`)) return;
    try {
      await api(`/staff/${m.id}`, { method: "DELETE" });
      await refetch();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Tu equipo</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Estilistas & staff</h1>
          <p className="mt-2 text-mauve-600 max-w-xl text-sm">
            Crea cuentas para tus trabajadoras. Cada una verá solo sus citas y podrá marcarlas
            como confirmadas o completadas — nunca verán precios ni ingresos del salón.
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary h-10 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
          Invitar a tu equipo
        </button>
      </div>

      {loading && !data ? (
        <LoadingBlock label="Cargando equipo" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : members.length === 0 ? (
        <EmptyBlock
          title="Aún no tienes equipo"
          description="Invita a tus estilistas con su email y una contraseña temporal. Podrán cambiar la contraseña al iniciar sesión."
          action={<button onClick={() => setShowNew(true)} className="btn btn-primary h-10 text-sm">Crear primera cuenta</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => {
            const inactive = m.stylist && !m.stylist.active;
            return (
              <article key={m.id} className="card-surface p-5">
                {/* Header: avatar + identity + (toggle for stylists / role chip for owners).
                    Toggle mirrors the one used in /dashboard/services for visual parity. */}
                <div className="flex items-start gap-3">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${tones[i % tones.length]} grid place-items-center text-cream font-serif text-lg shrink-0 ${inactive ? "grayscale opacity-60" : ""}`}>
                    {initials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg text-mauve-900 leading-tight truncate">{m.name}</div>
                    <div className="text-xs text-mauve-400 truncate font-mono">{m.email}</div>
                    {m.stylist?.role && <div className="text-xs text-mauve-600 mt-1 truncate">{m.stylist.role}</div>}
                  </div>
                  {m.stylist ? (
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1" title={inactive ? "Activar acceso" : "Pausar acceso"}>
                      <input
                        type="checkbox"
                        checked={!inactive}
                        onChange={() => toggleActive(m)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-mauve-900/10 peer-checked:bg-mauve-900 rounded-full transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-cream after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  ) : (
                    <span className="chip chip-gold text-[10px] shrink-0">Dueña</span>
                  )}
                </div>

                {m.stylist && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-cream-soft/60 px-3 py-2 gap-2">
                    <span className="text-[11px] text-mauve-500 min-w-0 truncate">
                      {m.stylist.hours.length > 0
                        ? `Horario propio · ${m.stylist.hours.length} día${m.stylist.hours.length === 1 ? "" : "s"}`
                        : "Hereda el horario del salón"}
                    </span>
                    <button onClick={() => setHoursFor(m)} className="text-[11px] font-medium text-mauve-900 underline-offset-4 hover:underline shrink-0">
                      🗓 Editar
                    </button>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-2">
                  <span className="text-[11px] text-mauve-400 truncate min-w-0">
                    Desde {formatDate(m.createdAt)}
                    {inactive && <span className="ml-2 text-blush-500">· Pausada</span>}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => setResetFor(m)}
                      className="btn btn-ghost h-9 text-[11px] px-3"
                      title="Restablecer contraseña"
                    >
                      🔑 Clave
                    </button>
                    <button
                      onClick={() => removeMember(m)}
                      className="btn btn-ghost h-9 text-[11px] px-3 text-blush-500 border-blush-300/30 hover:bg-blush-100/40"
                      title="Eliminar miembro"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showNew && <NewMemberModal onClose={() => setShowNew(false)} onCreated={refetch} />}
      {resetFor && <ResetPasswordModal member={resetFor} onClose={() => setResetFor(null)} />}
      {hoursFor?.stylist && (
        <StylistHoursModal member={hoursFor} onClose={() => setHoursFor(null)} onSaved={refetch} />
      )}
    </div>
  );
}

function StylistHoursModal({
  member,
  onClose,
  onSaved,
}: {
  member: Member;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const stylist = member.stylist!;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card-elevated w-full sm:max-w-lg p-6 sm:p-7 rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-mauve-900">Horario de {member.name.split(" ")[0]}</h3>
            <p className="text-sm text-mauve-600 mt-1">
              Define los días y horas en que atiende. Si lo dejas todo cerrado, hereda el horario del salón.
            </p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="mt-5">
          <WeeklyHoursEditor
            hours={stylist.hours}
            saveLabel="Guardar horario"
            compact
            onSave={async (hours) => {
              await api(`/stylists/${stylist.id}/hours`, { method: "PUT", body: { hours } });
              await onSaved();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function NewMemberModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", stylistRole: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api("/staff", {
        method: "POST",
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          role: "STYLIST",
          stylistRole: form.stylistRole || null,
        },
      });
      await onCreated();
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const suggest = () => {
    const password = Math.random().toString(36).slice(2, 10);
    setForm({ ...form, password });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="card-elevated p-6 sm:p-7 w-full max-w-md rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-serif text-2xl text-mauve-900">Nueva estilista</h3>
        <p className="text-sm text-mauve-600 mt-1">
          Le creas la cuenta — ella inicia sesión y puede cambiar su contraseña.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre completo</label>
            <input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-soft mt-1.5" placeholder="Nombre completo" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-soft mt-1.5" placeholder="email@tusalon.com" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Especialidad (opcional)</label>
            <input value={form.stylistRole} onChange={(e) => setForm({ ...form, stylistRole: e.target.value })} className="input-soft mt-1.5" placeholder="Nail artist senior · Color" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Contraseña temporal</label>
            <div className="mt-1.5 flex gap-2">
              <input
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-soft flex-1 font-mono"
                placeholder="Mínimo 8 caracteres"
              />
              <button type="button" onClick={suggest} className="btn btn-ghost h-[2.875rem] px-3 text-xs">
                Sugerir
              </button>
            </div>
            <p className="text-[11px] text-mauve-400 mt-1">
              Compártela con ella por WhatsApp. Podrá cambiarla desde su perfil.
            </p>
          </div>
          {err && <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}
        </div>

        <div className="mt-6 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost h-10 px-5">Cancelar</button>
          <button type="submit" disabled={saving} className="btn btn-primary h-10 px-5 disabled:opacity-60">{saving ? "Creando…" : "Crear cuenta"}</button>
        </div>
      </form>
    </div>
  );
}

function ResetPasswordModal({ member, onClose }: { member: Member; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api(`/staff/${member.id}/password`, { method: "POST", body: { password } });
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="card-elevated p-6 sm:p-7 w-full max-w-sm rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-serif text-2xl text-mauve-900">Restablecer contraseña</h3>
        <p className="text-sm text-mauve-600 mt-1">para {member.name}</p>

        {done ? (
          <>
            <div className="mt-5 rounded-2xl bg-cream-soft p-4 border border-gold-400/30">
              <div className="text-[11px] uppercase tracking-wider text-gold-600">Nueva contraseña</div>
              <div className="mt-1 font-mono text-mauve-900 break-all">{password}</div>
              <p className="text-xs text-mauve-600 mt-2">Compártela con ella. Su sesión actual fue cerrada.</p>
            </div>
            <button onClick={onClose} className="btn btn-primary w-full h-10 mt-5">Listo</button>
          </>
        ) : (
          <>
            <div className="mt-5">
              <label className="text-xs uppercase tracking-wider text-mauve-400">Nueva contraseña</label>
              <input
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-soft mt-1.5 font-mono"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            {err && <div className="mt-3 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}
            <div className="mt-5 flex gap-2 justify-end">
              <button type="button" onClick={onClose} className="btn btn-ghost h-10 px-5">Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary h-10 px-5 disabled:opacity-60">{saving ? "Guardando…" : "Restablecer"}</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
