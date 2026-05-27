"use client";

import { useMemo, useState } from "react";
import { api, ApiError } from "../_lib/api";
import { useApi } from "../_lib/useFetch";
import { useAuth } from "../_lib/auth";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../_components/dashboard/States";
import { formatTime, initials } from "../_lib/format";
import { statusChip, translateStatus } from "../_lib/status";
import type { AppointmentStatus } from "../_lib/types";

type PortalAppt = {
  id: string;
  startAt: string;
  endAt: string;
  durationMin: number;
  status: AppointmentStatus;
  notes: string | null;
  service: { id: string; name: string; durationMin: number; category: string | null };
  client: { id: string; name: string; phone: string | null };
};

export default function PortalTodayPage() {
  const { user } = useAuth();
  const todayRange = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + 86_400_000);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const apptsQ = useApi<{ appointments: PortalAppt[] }>(
    `/me/appointments?from=${encodeURIComponent(todayRange.from)}&to=${encodeURIComponent(todayRange.to)}`
  );
  const statsQ = useApi<{ stats: { todayAppointments: number; weekConfirmed: number; weekCompleted: number } }>(
    "/me/stats"
  );

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const setStatus = async (id: string, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await api(`/me/appointments/${id}/status`, { method: "PATCH", body: { status } });
      await apptsQ.refetch();
      await statsQ.refetch();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Error");
    } finally {
      setUpdatingId(null);
    }
  };

  const appts = apptsQ.data?.appointments ?? [];
  const stats = statsQ.data?.stats;

  const today = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-mauve-400 capitalize">{today}</div>
        <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">
          Hola {user?.name?.split(" ")[0] ?? ""} <em className="not-italic text-rose-shimmer">✨</em>
        </h1>
        <p className="mt-2 text-mauve-600 text-sm max-w-xl">
          Estas son tus citas de hoy. Marca cada una como confirmada o completada conforme avance tu día.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Hoy", val: stats?.todayAppointments ?? 0, tone: "from-blush-100 to-blush-200" },
          { label: "Confirmadas (7d)", val: stats?.weekConfirmed ?? 0, tone: "from-lavender-100 to-lavender-200" },
          { label: "Completadas (7d)", val: stats?.weekCompleted ?? 0, tone: "from-gold-300/40 to-gold-300/60" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 bg-gradient-to-br ${s.tone}`}>
            <div className="text-[10px] uppercase tracking-wider text-mauve-600 font-medium">{s.label}</div>
            <div className="mt-1 font-serif text-2xl text-mauve-900">{s.val}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-xl text-mauve-900">Tu agenda</h2>
        {apptsQ.loading && !apptsQ.data ? (
          <div className="mt-4"><LoadingBlock label="Cargando tus citas" /></div>
        ) : apptsQ.error ? (
          <div className="mt-4"><ErrorBlock error={apptsQ.error} onRetry={apptsQ.refetch} /></div>
        ) : appts.length === 0 ? (
          <div className="mt-4">
            <EmptyBlock
              title="Día libre ✦"
              description="No tienes citas hoy. Disfruta tu descanso o aprovecha para preparar materiales."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {appts.map((a) => (
              <ApptCard key={a.id} appt={a} updating={updatingId === a.id} onStatus={(s) => setStatus(a.id, s)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApptCard({
  appt,
  updating,
  onStatus,
}: {
  appt: PortalAppt;
  updating: boolean;
  onStatus: (s: AppointmentStatus) => void;
}) {
  const time = formatTime(appt.startAt);
  const end = formatTime(appt.endAt);

  return (
    <article className="card-surface p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="text-center w-16 shrink-0">
          <div className="font-serif text-xl text-mauve-900 leading-none">{time}</div>
          <div className="text-[10px] text-mauve-400 mt-1">→ {end}</div>
          <div className="text-[10px] text-mauve-400">{appt.durationMin} min</div>
        </div>

        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-lavender-200 to-lavender-400 grid place-items-center text-mauve-900 font-medium shrink-0">
          {initials(appt.client.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-serif text-lg text-mauve-900 leading-tight">{appt.client.name}</div>
            <span className={`chip ${statusChip(appt.status)} text-[10px]`}>{translateStatus(appt.status)}</span>
          </div>
          <div className="text-sm text-mauve-600 mt-0.5">{appt.service.name}</div>
          {appt.client.phone && (
            <a
              href={`https://wa.me/${appt.client.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-mauve-700 mt-2 hover:text-mauve-900 underline-offset-4 hover:underline"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5l.3-.4c.1-.2.1-.3 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.5 5.3L2 22l4.8-1.5c1.5.8 3.3 1.3 5.2 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3.4 1.1 1.1-3.3-.2-.3c-.9-1.4-1.4-3.1-1.4-4.8 0-5 4-9 9-9s9 4 9 9-4.1 8.8-9.1 8.8z"/></svg>
              {appt.client.phone}
            </a>
          )}
          {appt.notes && (
            <p className="mt-2 text-xs text-mauve-600 bg-cream-soft rounded-lg px-3 py-2 border border-line">
              <span className="text-[10px] uppercase tracking-wider text-mauve-400">Notas: </span>
              {appt.notes}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-line flex flex-wrap gap-2">
        {appt.status === "PENDING" && (
          <button disabled={updating} onClick={() => onStatus("CONFIRMED")} className="btn btn-primary h-9 text-xs disabled:opacity-60">
            ✓ Confirmar cita
          </button>
        )}
        {appt.status === "CONFIRMED" && (
          <button disabled={updating} onClick={() => onStatus("COMPLETED")} className="btn btn-primary h-9 text-xs disabled:opacity-60">
            ✓ Marcar completada
          </button>
        )}
        {appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && appt.status !== "NO_SHOW" && (
          <>
            <button disabled={updating} onClick={() => onStatus("NO_SHOW")} className="btn btn-ghost h-9 text-xs disabled:opacity-60">
              No asistió
            </button>
            <button disabled={updating} onClick={() => onStatus("CANCELLED")} className="btn btn-ghost h-9 text-xs text-blush-500 disabled:opacity-60">
              Cancelar
            </button>
          </>
        )}
        {(appt.status === "COMPLETED" || appt.status === "CANCELLED" || appt.status === "NO_SHOW") && (
          <span className="text-xs text-mauve-400 self-center">Cerrada — sin más acciones</span>
        )}
      </div>
    </article>
  );
}
