"use client";

import { useMemo, useState } from "react";
import { api, ApiError } from "../../_lib/api";
import { formatDate } from "../../_lib/format";
import type { BlockedSlot } from "../../_lib/types";

// Build an all-day block range (local midnight → next local midnight).
function dayRange(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(y!, (m ?? 1) - 1, d, 0, 0, 0, 0);
  const end = new Date(start.getTime() + 86_400_000);
  return { startAt: start.toISOString(), endAt: end.toISOString() };
}

export default function BlocksManager({
  blocks,
  stylists = [],
  onClose,
  onChanged,
}: {
  blocks: BlockedSlot[];
  stylists?: { id: string; name: string }[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const today = new Date();
  const [date, setDate] = useState(() => today.toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [stylistId, setStylistId] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stylistName = (id: string | null) => (id ? stylists.find((s) => s.id === id)?.name ?? "Estilista" : null);

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)),
    [blocks]
  );

  const add = async () => {
    if (!date) return;
    setSaving(true);
    setErr(null);
    try {
      const { startAt, endAt } = dayRange(date);
      await api("/schedules/blocks", {
        method: "POST",
        body: { startAt, endAt, reason: reason || null, stylistId: stylistId || null },
      });
      setReason("");
      await onChanged();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "No pudimos bloquear la fecha.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await api(`/schedules/blocks/${id}`, { method: "DELETE" });
      await onChanged();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "No pudimos quitar el bloqueo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-3 sm:p-4 bg-mauve-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card-elevated w-full sm:max-w-md p-6 sm:p-7 rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-mauve-900">Bloquear fechas</h3>
            <p className="text-sm text-mauve-600 mt-1">
              Marca días en los que no atiendes (vacaciones, feriados). Las clientas no podrán reservar esos días.
            </p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Add form */}
        <div className="mt-5 rounded-2xl border border-line p-4 space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Fecha a bloquear</label>
            <input
              type="date"
              value={date}
              min={today.toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="input-soft mt-1.5"
            />
          </div>
          {stylists.length > 0 && (
            <div>
              <label className="text-xs uppercase tracking-wider text-mauve-400">¿A quién aplica?</label>
              <select value={stylistId} onChange={(e) => setStylistId(e.target.value)} className="input-soft mt-1.5">
                <option value="">Todo el salón</option>
                {stylists.map((s) => (
                  <option key={s.id} value={s.id}>
                    Solo {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-wider text-mauve-400">Motivo (opcional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={120}
              placeholder="Ej. Feriado · Vacaciones · Capacitación"
              className="input-soft mt-1.5"
            />
          </div>
          <button onClick={add} disabled={saving || !date} className="btn btn-primary w-full h-11 disabled:opacity-60">
            {saving ? "Bloqueando…" : "Bloquear este día"}
          </button>
        </div>

        {err && <div className="mt-4 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}

        {/* List */}
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2">Bloqueos del mes</div>
          {sorted.length === 0 ? (
            <p className="text-sm text-mauve-500 py-3 text-center">No hay fechas bloqueadas este mes.</p>
          ) : (
            <ul className="space-y-2">
              {sorted.map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <div className="h-9 w-9 rounded-xl bg-blush-100 grid place-items-center text-blush-500 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-mauve-900 capitalize">{formatDate(b.startAt)}</div>
                    <div className="text-xs text-mauve-400 truncate">
                      {b.reason || "Día bloqueado"} · {stylistName(b.stylistId) ? `Solo ${stylistName(b.stylistId)}` : "Todo el salón"}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(b.id)}
                    disabled={deletingId === b.id}
                    className="h-8 w-8 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-blush-100 hover:text-blush-500 transition disabled:opacity-60"
                    title="Quitar bloqueo"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
