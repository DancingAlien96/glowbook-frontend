"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useAuth } from "../../_lib/auth";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import { initials } from "../../_lib/format";

type Profile = {
  id: string;
  name: string;
  role: string | null;
  active: boolean;
  services: { service: { id: string; name: string; durationMin: number } }[];
  salon: { id: string; name: string; slug: string };
};

export default function PortalProfilePage() {
  const { user, refresh } = useAuth();
  const { data, loading, error, refetch } = useApi<{ stylist: Profile }>("/me/profile");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (data?.stylist) setName(data.stylist.name);
  }, [data]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password && password !== confirm) {
      setErr("Las contraseñas no coinciden");
      return;
    }
    setSaving(true);
    try {
      await api("/me/profile", {
        method: "PATCH",
        body: {
          name: name && name !== data?.stylist.name ? name : undefined,
          password: password || undefined,
        },
      });
      setSavedAt(Date.now());
      setPassword("");
      setConfirm("");
      await Promise.all([refetch(), refresh()]);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) return <LoadingBlock label="Cargando perfil" />;
  if (error) return <ErrorBlock error={error} onRetry={refetch} />;
  if (!data) return null;

  const p = data.stylist;

  return (
    <form onSubmit={onSave} className="space-y-6 max-w-2xl">
      <div>
        <div className="text-xs text-mauve-400">Cuenta</div>
        <h1 className="font-serif text-3xl text-mauve-900 leading-tight">Mi perfil</h1>
      </div>

      <section className="card-surface p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif text-2xl">
            {initials(p.name)}
          </div>
          <div>
            <div className="font-serif text-xl text-mauve-900">{p.name}</div>
            <div className="text-xs text-mauve-400 font-mono">{user?.email}</div>
            <div className="text-xs text-mauve-600 mt-0.5">{p.salon.name}</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre visible</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-soft mt-1.5" />
            <p className="text-[11px] text-mauve-400 mt-1">Así aparecerás en la página de reservas del salón.</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Especialidad</label>
            <input value={p.role ?? "—"} disabled className="input-soft mt-1.5 opacity-60 cursor-not-allowed" />
            <p className="text-[11px] text-mauve-400 mt-1">Pídele a la dueña que la actualice si necesitas cambiarla.</p>
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Cambiar contraseña</h2>
        <p className="text-sm text-mauve-600 mt-1">Déjala vacía si no quieres cambiarla.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Nueva contraseña</label>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-soft mt-1.5"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Confirma</label>
            <input
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-soft mt-1.5"
            />
          </div>
        </div>
      </section>

      <section className="card-surface p-6">
        <h2 className="font-serif text-xl text-mauve-900">Servicios que ofreces</h2>
        <p className="text-sm text-mauve-600 mt-1">
          La dueña define qué servicios puedes atender. Estos son los tuyos:
        </p>
        {p.services.length === 0 ? (
          <p className="mt-3 text-sm text-mauve-500">Aún no tienes servicios asignados.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {p.services.map((s) => (
              <span key={s.service.id} className="chip chip-blush">
                {s.service.name}
                <span className="text-mauve-400 ml-1.5">{s.service.durationMin} min</span>
              </span>
            ))}
          </div>
        )}
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
