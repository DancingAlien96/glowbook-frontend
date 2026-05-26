"use client";

import { useMemo, useState } from "react";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock } from "../../_components/dashboard/States";
import { initials } from "../../_lib/format";
import { statusChip, translateStatus } from "../../_lib/status";
import type { Appointment, Stylist } from "../../_lib/types";

const hours = Array.from({ length: 11 }, (_, i) => 9 + i); // 9..19
const HOUR_PX = 80;

const stylistGradients = [
  "from-blush-200 to-blush-300 border-blush-400/40",
  "from-lavender-100 to-lavender-200 border-lavender-400/40",
  "from-gold-300/40 to-gold-300/60 border-gold-400/40",
  "from-nude-200 to-nude-300 border-nude-300/40",
];

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const day = (r.getDay() + 6) % 7; // Monday=0
  r.setDate(r.getDate() - day);
  return r;
}

export default function AppointmentsPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [stylistFilter, setStylistFilter] = useState<string>("");

  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 7 * 86_400_000), [weekStart]);

  const stylistsQ = useApi<{ stylists: Stylist[] }>("/stylists");
  const apptsQ = useApi<{ appointments: Appointment[] }>(
    `/appointments?from=${encodeURIComponent(weekStart.toISOString())}&to=${encodeURIComponent(weekEnd.toISOString())}${stylistFilter ? `&stylistId=${stylistFilter}` : ""}`,
    [weekStart.toISOString(), stylistFilter]
  );

  const days = useMemo(() => {
    const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return { label: labels[i]!, day: d.getDate(), date: d };
    });
  }, [weekStart]);

  const stylists = stylistsQ.data?.stylists ?? [];
  const colorByStylist: Record<string, string> = {};
  stylists.forEach((s, i) => (colorByStylist[s.id] = stylistGradients[i % stylistGradients.length]!));

  const appts = apptsQ.data?.appointments ?? [];

  const todayIso = (() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.toISOString().slice(0, 10);
  })();

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">
            {weekStart.toLocaleDateString("es-EC", { month: "long", year: "numeric" })}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Agenda</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86_400_000))} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="btn btn-ghost h-9 text-xs">Hoy</button>
          <button onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86_400_000))} className="h-9 w-9 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
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
          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-line">
            <div />
            {days.map((d) => {
              const isToday = d.date.toISOString().slice(0, 10) === todayIso;
              return (
                <div key={d.day} className={`p-3 text-center border-l border-line ${isToday ? "bg-blush-100/40" : ""}`}>
                  <div className="text-[10px] uppercase tracking-wider text-mauve-400">{d.label}</div>
                  <div className={`mt-0.5 font-serif text-lg ${isToday ? "text-blush-500" : "text-mauve-900"}`}>{d.day}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] relative">
            <div className="border-r border-line">
              {hours.map((h) => (
                <div key={h} className="px-2 text-[10px] text-mauve-400 text-right -translate-y-1.5" style={{ height: HOUR_PX }}>
                  {h}:00
                </div>
              ))}
            </div>

            {days.map((d, di) => {
              const dayStart = new Date(d.date);
              dayStart.setHours(0, 0, 0, 0);
              const dayApps = appts.filter((a) => {
                const start = new Date(a.startAt);
                return start >= dayStart && start < new Date(dayStart.getTime() + 86_400_000);
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
                    const tone = a.stylist ? colorByStylist[a.stylist.id] ?? stylistGradients[0]! : stylistGradients[3]!;
                    return (
                      <div
                        key={a.id}
                        className={`absolute left-1 right-1 rounded-xl border bg-gradient-to-br ${tone} p-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer ${a.status === "CANCELLED" ? "opacity-50 line-through" : ""}`}
                        style={{ top, height }}
                        title={`${a.client.name} · ${a.service.name}`}
                      >
                        <div className="text-[10px] text-mauve-700 font-medium">
                          {start.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                          {a.stylist ? ` · ${a.stylist.name.split(" ")[0]}` : ""}
                        </div>
                        <div className="text-xs font-medium text-mauve-900 truncate flex items-center gap-1">
                          <span className="h-5 w-5 rounded-full bg-cream/60 text-[9px] grid place-items-center text-mauve-900">{initials(a.client.name)}</span>
                          {a.client.name}
                        </div>
                        <div className="text-[10px] text-mauve-600 truncate">{a.service.name}</div>
                        <div className="mt-1">
                          <span className={`chip ${statusChip(a.status)} text-[9px] py-0`}>{translateStatus(a.status)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
