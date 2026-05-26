"use client";

import { useMemo, useState } from "react";
import { useApi } from "../../_lib/useFetch";
import { LoadingBlock, ErrorBlock, EmptyBlock } from "../../_components/dashboard/States";
import { initials } from "../../_lib/format";
import type { Client, ClientTag } from "../../_lib/types";

const tagStyles: Record<ClientTag, string> = {
  VIP: "chip-gold",
  RETURNING: "chip-lavender",
  NEW: "chip-blush",
};
const tagLabel: Record<ClientTag, string> = {
  VIP: "VIP",
  RETURNING: "Frecuente",
  NEW: "Nueva",
};
const tones = ["from-blush-300 to-blush-500", "from-lavender-200 to-lavender-400", "from-gold-300 to-gold-500", "from-nude-200 to-nude-300", "from-blush-200 to-blush-400"];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState<"" | ClientTag>("");
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (tag) p.set("tag", tag);
    p.set("pageSize", "50");
    return p.toString();
  }, [search, tag]);

  const { data, loading, error, refetch } = useApi<{
    clients: Client[];
    pagination: { total: number };
  }>(`/clients?${query}`, [query]);

  const clients = data?.clients ?? [];
  const total = data?.pagination.total ?? 0;
  const vipCount = clients.filter((c) => c.tag === "VIP").length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs text-mauve-400">Tu comunidad</div>
          <h1 className="font-serif text-3xl sm:text-4xl text-mauve-900 leading-tight">Clientas</h1>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total clientas", val: String(total) },
          { label: "VIP (página)", val: String(vipCount) },
          { label: "Filtro activo", val: tag ? tagLabel[tag] : "Todas" },
          { label: "Búsqueda", val: search || "—" },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">{s.label}</div>
            <div className="mt-1 font-serif text-2xl text-mauve-900 truncate">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card-surface p-0 overflow-hidden">
        <div className="p-4 flex flex-wrap gap-3 items-center justify-between border-b border-line">
          <div className="relative flex-1 min-w-64">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono…"
              className="input-soft pl-10 h-10"
            />
          </div>
          <div className="flex gap-1.5">
            {(["", "VIP", "RETURNING", "NEW"] as const).map((t) => (
              <button
                key={t || "all"}
                onClick={() => setTag(t)}
                className={`chip ${tag === t ? "bg-mauve-900 text-cream" : "chip-cream"} hover:scale-105 transition`}
              >
                {t ? tagLabel[t] : "Todas"}
              </button>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <LoadingBlock label="Cargando clientas" />
        ) : error ? (
          <ErrorBlock error={error} onRetry={refetch} />
        ) : clients.length === 0 ? (
          <EmptyBlock title="Sin clientas aún" description="Las clientas que reserven aparecerán aquí automáticamente." />
        ) : (
          <table className="w-full">
            <thead className="bg-cream-soft text-[11px] uppercase tracking-wider text-mauve-400">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Clienta</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Contacto</th>
                <th className="text-left px-5 py-3 font-medium">Visitas</th>
                <th className="text-left px-5 py-3 font-medium">Etiqueta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((c, i) => (
                <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${tones[i % tones.length]} grid place-items-center text-cream font-serif`}>
                        {initials(c.name)}
                      </div>
                      <div className="font-medium text-mauve-900">{c.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-mauve-600 hidden md:table-cell">
                    <div>{c.email ?? "—"}</div>
                    <div className="text-xs text-mauve-400">{c.phone ?? ""}</div>
                  </td>
                  <td className="px-5 py-3.5 text-mauve-900 font-medium">
                    {c._count?.appointments ?? 0}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`chip ${tagStyles[c.tag]}`}>{tagLabel[c.tag]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
