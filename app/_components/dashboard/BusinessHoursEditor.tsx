"use client";

import { api } from "../../_lib/api";
import WeeklyHoursEditor from "./WeeklyHoursEditor";
import type { BusinessHour } from "../../_lib/types";

export default function BusinessHoursEditor({ businessHours }: { businessHours?: BusinessHour[] }) {
  return (
    <section className="card-surface p-6">
      <div className="mb-4">
        <h2 className="font-serif text-xl text-mauve-900">Horarios de atención</h2>
        <p className="text-sm text-mauve-600 mt-1">
          Define cuándo está abierto tu salón. Las clientas solo podrán reservar dentro de estos horarios
          (cada estilista puede tener un horario propio desde Equipo).
        </p>
      </div>
      <WeeklyHoursEditor
        hours={businessHours}
        onSave={(hours) => api("/salon/me/hours", { method: "PUT", body: { hours } })}
      />
    </section>
  );
}
