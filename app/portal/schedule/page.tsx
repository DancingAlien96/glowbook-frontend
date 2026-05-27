"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import { formatTime, initials } from "../../_lib/format";
import type { AppointmentStatus } from "../../_lib/types";

type PortalAppt = {
  id: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  status: AppointmentStatus;
  service: { name: string };
  client: { name: string; phone: string | null };
};

const HOUR_PX = 70;
const hours = Array.from({ length: 11 }, (_, i) => 9 + i);

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const day = (r.getDay() + 6) % 7;
  r.setDate(r.getDate() - day);
  return r;
}

export default function PortalSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 7 * 86_400_000), [weekStart]);

  const apptsQ = useApi<{ appointments: PortalAppt[] }>(
    `/me/appointments?from=${encodeURIComponent(weekStart.toISOString())}&to=${encodeURIComponent(weekEnd.toISOString())}`,
    [weekStart.toISOString()]
  );

  const days = useMemo(() => {
    const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return { label: labels[i]!, day: d.getDate(), date: d };
    });
  }, [weekStart]);

  const todayIso = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.toISOString().slice(0, 10);
  })();

  const appts = apptsQ.data?.appointments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">
            {weekStart.toLocaleDateString("es-EC", { month: "long", year: "numeric" })}
          </div>
          <h1 className="font-serif text-3xl text-mauve-900 leading-tight">Mi semana</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86_400_000))} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="btn btn-ghost h-9 text-xs">Esta semana</button>
          <button onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86_400_000))} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      {apptsQ.loading && !apptsQ.data ? (
        <LoadingBlock label="Cargando tu semana" />
      ) : apptsQ.error ? (
        <ErrorBlock error={apptsQ.error} onRetry={apptsQ.refetch} />
      ) : (
        <div className="card-surface p-0 overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))] border-b border-line">
              <div />
              {days.map((d) => {
                const isToday = d.date.toISOString().slice(0, 10) === todayIso;
                return (
                  <div key={d.day} className={`p-2 text-center border-l border-line ${isToday ? "bg-blush-100/40" : ""}`}>
                    <div className="text-[10px] uppercase tracking-wider text-mauve-400">{d.label}</div>
                    <div className={`mt-0.5 font-serif text-lg ${isToday ? "text-blush-500" : "text-mauve-900"}`}>{d.day}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))]">
              <div className="border-r border-line">
                {hours.map((h) => (
                  <div key={h} className="px-1.5 text-[10px] text-mauve-400 text-right -translate-y-1.5" style={{ height: HOUR_PX }}>
                    {h}:00
                  </div>
                ))}
              </div>

              {days.map((d, di) => {
                const dayStart = new Date(d.date);
                dayStart.setHours(0, 0, 0, 0);
                const dayApps = appts.filter((a) => {
                  const s = new Date(a.startAt);
                  return s >= dayStart && s < new Date(dayStart.getTime() + 86_400_000);
                });

                return (
                  <div key={di} className="relative border-l border-line">
                    {hours.map((h) => (
                      <div key={h} className="border-b border-line/60" style={{ height: HOUR_PX }} />
                    ))}
                    {dayApps.map((a) => {
                      const start = new Date(a.startAt);
                      const startHours = start.getHours() + start.getMinutes() / 60;
                      if (startHours < hours[0]! || startHours > hours[hours.length - 1]! + 1) return null;
                      const top = (startHours - hours[0]!) * HOUR_PX;
                      const height = (a.durationMin / 60) * HOUR_PX - 4;
                      const tone =
                        a.status === "COMPLETED" ? "from-gold-300/40 to-gold-400/40 border-gold-400/40"
                        : a.status === "CANCELLED" || a.status === "NO_SHOW" ? "from-mauve-900/5 to-mauve-900/10 border-line"
                        : a.status === "CONFIRMED" ? "from-blush-200 to-blush-300 border-blush-400/40"
                        : "from-lavender-100 to-lavender-200 border-lavender-400/40";
                      return (
                        <Link
                          key={a.id}
                          href="/portal"
                          className={`absolute left-1 right-1 rounded-lg border bg-gradient-to-br ${tone} p-1.5 shadow-sm hover:shadow-md transition ${a.status === "CANCELLED" ? "opacity-50 line-through" : ""}`}
                          style={{ top, height }}
                          title={`${a.client.name} · ${a.service.name}`}
                        >
                          <div className="text-[10px] text-mauve-700 font-medium">{formatTime(start)}</div>
                          <div className="text-xs font-medium text-mauve-900 truncate flex items-center gap-1">
                            <span className="h-4 w-4 rounded-full bg-cream/70 text-[8px] grid place-items-center">{initials(a.client.name)}</span>
                            {a.client.name}
                          </div>
                          <div className="text-[10px] text-mauve-600 truncate">{a.service.name}</div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card-surface p-5 text-xs text-mauve-600">
        <div className="font-medium text-mauve-900 mb-2">Leyenda</div>
        <div className="flex flex-wrap gap-3">
          <Legend color="from-lavender-100 to-lavender-200" label="Pendiente" />
          <Legend color="from-blush-200 to-blush-300" label="Confirmada" />
          <Legend color="from-gold-300/40 to-gold-400/40" label="Completada" />
          <Legend color="from-mauve-900/5 to-mauve-900/10" label="Cancelada / No asistió" />
        </div>
        <p className="mt-3">Toca cualquier cita para volver a la vista de hoy y cambiar su estado.</p>
        <p className="mt-1 text-mauve-500">
          Las cifras visibles aquí no incluyen montos ni ingresos — esa información solo la ve la dueña del salón.
        </p>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-5 rounded bg-gradient-to-br ${color} border border-line`} />
      {label}
    </span>
  );
}