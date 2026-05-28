"use client";

import { useMemo, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { useApi } from "../../_lib/useFetch";
import { useAuth } from "../../_lib/auth";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { money } from "../../_lib/format";
import type { Service } from "../../_lib/types";

const tones = [
  "from-blush-200 to-blush-300",
  "from-lavender-100 to-lavender-200",
  "from-gold-300/40 to-gold-300/60",
  "from-nude-200 to-nude-300",
];

export default function ServicesPage() {
  const { user } = useAuth();
  const currency = user?.salon?.currency ?? "USD";

  const { data, loading, error, refetch } = useApi<{ services: Service[] }>("/services");
  const [cat, setCat] = useState("Todos");
  const [showNew, setShowNew] = useState(false);

  const services = data?.services ?? [];

  const categories = useMemo(() => {
    const all: Record<string, number> = { Todos: services.length };
    for (const s of services) {
      const c = s.category ?? "Sin categoría";
      all[c] = (all[c] ?? 0) + 1;
    }
    return Object.entries(all);
  }, [services]);

  const visible = cat === "Todos" ? services : services.filter((s) => (s.category ?? "Sin categoría") === cat);

  const toggleActive = async (s: Service) => {
    try {
      await api(`/services/${s.id}`, { method: "PATCH", body: { active: !s.active } });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (s: Service) => {
    if (!confirm(`¿Eliminar "${s.name}"?`)) return;
    try {
      await api(`/services/${s.id}`, { method: "DELETE" });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Catálogo</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Servicios</h1>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary h-10 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo servicio
        </button>
      </div>

      {loading && !data ? (
        <LoadingBlock label="Cargando servicios" />
      ) : error ? (
        <ErrorBlock error={error} onRetry={refetch} />
      ) : services.length === 0 ? (
        <EmptyBlock
          title="Aún no hay servicios"
          description="Empieza agregando tu primer servicio: nombre, duración y precio."
          action={<button onClick={() => setShowNew(true)} className="btn btn-primary h-10 text-sm">Crear servicio</button>}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {categories.map(([name, count]) => (
              <button
                key={name}
                onClick={() => setCat(name)}
                className={`chip ${cat === name ? "bg-mauve-900 text-cream" : "chip-cream"} hover:scale-105 transition`}
              >
                {name}
                <span className={`ml-1.5 ${cat === name ? "text-cream/60" : "text-mauve-400"}`}>{count}</span>
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((s, i) => (
              <article key={s.id} className="card-surface p-5 group hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] transition-all">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${tones[i % tones.length]} grid place-items-center`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-mauve-900" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/></svg>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.active}
                      onChange={() => toggleActive(s)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-mauve-900/10 peer-checked:bg-mauve-900 rounded-full transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-cream after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
                <h3 className="mt-4 font-serif text-xl text-mauve-900 leading-snug">{s.name}</h3>
                <div className="mt-1 text-xs text-mauve-400">{s.category ?? "Sin categoría"}</div>
                {s.description && <p className="mt-2 text-xs text-mauve-600 line-clamp-2">{s.description}</p>}

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-mauve-400">Precio</div>
                    <div className="font-serif text-2xl text-mauve-900">{money(s.priceCents, currency)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-mauve-400">Duración</div>
                    <div className="text-sm font-medium text-mauve-900">{s.durationMin} min</div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
                  <span className={`chip ${s.active ? "status-completed" : "chip-cream"} text-[10px]`}>
                    {s.active ? "Activo" : "Pausado"}
                  </span>
                  <button onClick={() => remove(s)} className="h-8 w-8 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-blush-100 hover:text-blush-500 transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {showNew && <NewServiceModal onClose={() => setShowNew(false)} onCreated={refetch} />}
    </div>
  );
}

function NewServiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [form, setForm] = useState({ name: "", category: "Uñas", durationMin: 60, price: 30, description: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await api("/services", {
        method: "POST",
        body: {
          name: form.name,
          category: form.category,
          durationMin: form.durationMin,
          priceCents: Math.round(form.price * 100),
          description: form.description || null,
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-4 bg-mauve-900/40 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="card-elevated p-6 sm:p-7 w-full max-w-md rounded-b-none sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-serif text-2xl text-mauve-900">Nuevo servicio</h3>
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-soft mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Categoría</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-soft mt-1.5">
                {["Uñas", "Cabello", "Mirada", "Maquillaje", "Estética", "Spa"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">Duración (min)</label>
              <input type="number" min={5} value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: +e.target.value })} className="input-soft mt-1.5" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Precio</label>
            <input type="number" step="0.01" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="input-soft mt-1.5" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Descripción</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-soft mt-1.5 h-auto py-3 resize-none" />
          </div>
          {err && <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}
        </div>
        <div className="mt-6 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn btn-ghost h-10 px-5">Cancelar</button>
          <button type="submit" disabled={saving} className="btn btn-primary h-10 px-5 disabled:opacity-60">{saving ? "Guardando…" : "Crear"}</button>
        </div>
      </form>
    </div>
  );
}
