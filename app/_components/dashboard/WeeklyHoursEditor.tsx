"use client";

import { useState } from "react";
import { ApiError } from "../../_lib/api";
import type { WeekHour } from "../../_lib/types";

// Display order Mon..Sun; dayOfWeek uses 0=Sun..6=Sat.
const DAYS: { dow: number; label: string }[] = [
  { dow: 1, label: "Lunes" },
  { dow: 2, label: "Martes" },
  { dow: 3, label: "Miércoles" },
  { dow: 4, label: "Jueves" },
  { dow: 5, label: "Viernes" },
  { dow: 6, label: "Sábado" },
  { dow: 0, label: "Domingo" },
];

const toTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

type Range = { openMin: number; closeMin: number };
// A day can have more than one range — e.g. 09:00-13:00 and 15:00-19:00 for
// a lunch break — so each day now holds a list instead of a single slot.
type DayState = { open: boolean; ranges: Range[] };

const DEFAULT_RANGE: Range = { openMin: 9 * 60, closeMin: 19 * 60 };

function initial(hours: WeekHour[] | undefined): Record<number, DayState> {
  const map: Record<number, DayState> = {};
  for (const d of DAYS) {
    const found = (hours ?? [])
      .filter((h) => h.dayOfWeek === d.dow)
      .sort((a, b) => a.openMin - b.openMin)
      .map((h) => ({ openMin: h.openMin, closeMin: h.closeMin }));
    map[d.dow] = found.length > 0 ? { open: true, ranges: found } : { open: false, ranges: [DEFAULT_RANGE] };
  }
  return map;
}

export default function WeeklyHoursEditor({
  hours,
  onSave,
  saveLabel = "Guardar horarios",
  compact = false,
}: {
  hours?: WeekHour[];
  onSave: (hours: WeekHour[]) => Promise<void>;
  saveLabel?: string;
  compact?: boolean;
}) {
  const [days, setDays] = useState<Record<number, DayState>>(() => initial(hours));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const setOpen = (dow: number, open: boolean) =>
    setDays((d) => ({
      ...d,
      [dow]: { open, ranges: d[dow]!.ranges.length > 0 ? d[dow]!.ranges : [DEFAULT_RANGE] },
    }));

  const updateRange = (dow: number, idx: number, patch: Partial<Range>) =>
    setDays((d) => ({
      ...d,
      [dow]: { ...d[dow]!, ranges: d[dow]!.ranges.map((r, i) => (i === idx ? { ...r, ...patch } : r)) },
    }));

  const addRange = (dow: number) =>
    setDays((d) => {
      const ranges = d[dow]!.ranges;
      const last = ranges[ranges.length - 1];
      // Seed the new range right after the previous one closes, so adding a
      // second block for a lunch break doesn't require retyping both times.
      const start = last ? Math.min(last.closeMin + 60, 1440) : DEFAULT_RANGE.openMin;
      const end = Math.min(start + 4 * 60, 1440);
      return { ...d, [dow]: { ...d[dow]!, ranges: [...ranges, { openMin: start, closeMin: end }] } };
    });

  const removeRange = (dow: number, idx: number) =>
    setDays((d) => {
      const ranges = d[dow]!.ranges.filter((_, i) => i !== idx);
      // No ranges left → the day reads as closed rather than leaving a
      // toggle stuck "open" with nothing to open at.
      return { ...d, [dow]: { open: ranges.length > 0, ranges: ranges.length > 0 ? ranges : [DEFAULT_RANGE] } };
    });

  const applyToAll = () => {
    const mon = days[1]!;
    setDays((d) => {
      const next = { ...d };
      for (const day of DAYS) {
        if (next[day.dow]!.open) next[day.dow] = { ...next[day.dow]!, ranges: mon.ranges.map((r) => ({ ...r })) };
      }
      return next;
    });
  };

  const save = async () => {
    setErr(null);
    for (const d of DAYS) {
      const s = days[d.dow]!;
      if (!s.open) continue;
      const sorted = [...s.ranges].sort((a, b) => a.openMin - b.openMin);
      for (let i = 0; i < sorted.length; i++) {
        const r = sorted[i]!;
        if (r.closeMin <= r.openMin) {
          setErr(`En ${d.label}, la hora de cierre debe ser mayor a la de apertura.`);
          return;
        }
        if (i > 0 && r.openMin < sorted[i - 1]!.closeMin) {
          setErr(`En ${d.label}, los rangos de horario no pueden traslaparse.`);
          return;
        }
      }
    }
    setSaving(true);
    try {
      const result = DAYS.filter((d) => days[d.dow]!.open).flatMap((d) =>
        days[d.dow]!.ranges.map((r) => ({ dayOfWeek: d.dow, openMin: r.openMin, closeMin: r.closeMin }))
      );
      await onSave(result);
      setSavedAt(Date.now());
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Error al guardar horarios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {!compact && (
        <div className="flex justify-end mb-2">
          <button type="button" onClick={applyToAll} className="btn btn-ghost h-9 text-xs">Copiar lunes a todos</button>
        </div>
      )}

      <div className="space-y-2">
        {DAYS.map((d) => {
          const s = days[d.dow]!;
          return (
            <div key={d.dow} className={`flex flex-wrap items-start gap-3 rounded-2xl border p-3 transition ${s.open ? "border-line bg-ivory" : "border-line bg-cream-soft/40"}`}>
              <label className="flex items-center gap-2.5 w-32 shrink-0 cursor-pointer pt-1.5">
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={s.open} onChange={(e) => setOpen(d.dow, e.target.checked)} className="sr-only peer" />
                  <span className="w-9 h-5 bg-mauve-900/10 peer-checked:bg-mauve-900 rounded-full transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-cream after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </span>
                <span className={`text-sm font-medium ${s.open ? "text-mauve-900" : "text-mauve-400"}`}>{d.label}</span>
              </label>

              {s.open ? (
                <div className="flex-1 min-w-[220px] space-y-1.5">
                  {s.ranges.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <input type="time" value={toTime(r.openMin)} onChange={(e) => updateRange(d.dow, idx, { openMin: toMin(e.target.value) })} className="input-soft h-9 w-28 px-3" />
                      <span className="text-mauve-400">a</span>
                      <input type="time" value={toTime(r.closeMin)} onChange={(e) => updateRange(d.dow, idx, { closeMin: toMin(e.target.value) })} className="input-soft h-9 w-28 px-3" />
                      {s.ranges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRange(d.dow, idx)}
                          aria-label={`Quitar rango de ${d.label}`}
                          className="h-7 w-7 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-500 hover:bg-blush-100 hover:text-blush-500 transition shrink-0"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addRange(d.dow)}
                    className="text-xs text-mauve-500 hover:text-mauve-900 inline-flex items-center gap-1 mt-0.5"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Agregar rango (ej. descanso al mediodía)
                  </button>
                </div>
              ) : (
                <span className="text-sm text-mauve-400 pt-1.5">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      {compact && (
        <div className="mt-3">
          <button type="button" onClick={applyToAll} className="text-xs text-mauve-500 hover:text-mauve-900 underline-offset-4 hover:underline">
            Copiar lunes a todos los días abiertos
          </button>
        </div>
      )}

      {err && <div className="mt-4 text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">{err}</div>}

      <div className="mt-5 flex items-center justify-end gap-3">
        {savedAt && <span className="text-xs text-mauve-500">Guardado ✓</span>}
        <button type="button" onClick={save} disabled={saving} className="btn btn-primary h-11 px-6 disabled:opacity-60">
          {saving ? "Guardando…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
