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

type DayState = { open: boolean; openMin: number; closeMin: number };

function initial(hours: WeekHour[] | undefined): Record<number, DayState> {
  const map: Record<number, DayState> = {};
  for (const d of DAYS) {
    const found = hours?.find((h) => h.dayOfWeek === d.dow);
    map[d.dow] = found
      ? { open: true, openMin: found.openMin, closeMin: found.closeMin }
      : { open: false, openMin: 9 * 60, closeMin: 19 * 60 };
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

  const update = (dow: number, patch: Partial<DayState>) =>
    setDays((d) => ({ ...d, [dow]: { ...d[dow]!, ...patch } }));

  const applyToAll = () => {
    const mon = days[1]!;
    setDays((d) => {
      const next = { ...d };
      for (const day of DAYS) if (next[day.dow]!.open) next[day.dow] = { ...next[day.dow]!, openMin: mon.openMin, closeMin: mon.closeMin };
      return next;
    });
  };

  const save = async () => {
    setErr(null);
    for (const d of DAYS) {
      const s = days[d.dow]!;
      if (s.open && s.closeMin <= s.openMin) {
        setErr(`En ${d.label}, la hora de cierre debe ser mayor a la de apertura.`);
        return;
      }
    }
    setSaving(true);
    try {
      const result = DAYS.filter((d) => days[d.dow]!.open).map((d) => ({
        dayOfWeek: d.dow,
        openMin: days[d.dow]!.openMin,
        closeMin: days[d.dow]!.closeMin,
      }));
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
            <div key={d.dow} className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 transition ${s.open ? "border-line bg-ivory" : "border-line bg-cream-soft/40"}`}>
              <label className="flex items-center gap-2.5 w-32 shrink-0 cursor-pointer">
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={s.open} onChange={(e) => update(d.dow, { open: e.target.checked })} className="sr-only peer" />
                  <span className="w-9 h-5 bg-mauve-900/10 peer-checked:bg-mauve-900 rounded-full transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-cream after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </span>
                <span className={`text-sm font-medium ${s.open ? "text-mauve-900" : "text-mauve-400"}`}>{d.label}</span>
              </label>

              {s.open ? (
                <div className="flex items-center gap-2 text-sm">
                  <input type="time" value={toTime(s.openMin)} onChange={(e) => update(d.dow, { openMin: toMin(e.target.value) })} className="input-soft h-9 w-28 px-3" />
                  <span className="text-mauve-400">a</span>
                  <input type="time" value={toTime(s.closeMin)} onChange={(e) => update(d.dow, { closeMin: toMin(e.target.value) })} className="input-soft h-9 w-28 px-3" />
                </div>
              ) : (
                <span className="text-sm text-mauve-400">Cerrado</span>
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
