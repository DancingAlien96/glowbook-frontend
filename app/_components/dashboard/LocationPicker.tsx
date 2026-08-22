"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { api, ApiError } from "../../_lib/api";

type GeoResult = { lat: number; lon: number; label: string };
type Value = { address: string | null; latitude: number | null; longitude: number | null };

// Guatemala City — just a reasonable starting viewport when the salon
// hasn't picked a location yet. Searching or dropping a pin overrides it
// immediately; this only affects what's on screen before either happens.
const DEFAULT_CENTER: [number, number] = [14.6349, -90.5069];

// Map-based location picker — replaces freehand address typing. The dueña
// searches or drops/drags a pin; we reverse-geocode the pin into a
// human-readable label (still editable, since geocoding isn't always
// precise) instead of asking her to type coordinates or a full address
// blind. Leaflet is loaded dynamically (client-only — it touches `window`)
// so it never enters the server bundle.
export default function LocationPicker({ value, onChange }: { value: Value; onChange: (v: Value) => void }) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const placeRef = useRef<((lat: number, lon: number, recenter?: boolean) => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Mount the map once. Reads the initial value via valueRef so this effect
  // never needs to re-run (and re-create the map) when the parent's value
  // changes from our own onChange calls.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapElRef.current || mapRef.current) return;

      const start = valueRef.current;
      const hasPin = start.latitude != null && start.longitude != null;
      const center: [number, number] = hasPin ? [start.latitude!, start.longitude!] : DEFAULT_CENTER;

      const map = L.map(mapElRef.current).setView(center, hasPin ? 16 : 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#A8442F;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(31,15,21,0.35)"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });

      const reverseGeocode = async (lat: number, lon: number) => {
        try {
          const { label } = await api<{ label: string | null }>(`/salon/me/geocode/reverse?lat=${lat}&lon=${lon}`);
          onChangeRef.current({ address: label, latitude: lat, longitude: lon });
        } catch {
          // Keep the pin even if reverse geocoding fails — she can still
          // type/edit the label by hand.
          onChangeRef.current({ address: valueRef.current.address, latitude: lat, longitude: lon });
        }
      };

      const place = (lat: number, lon: number, recenter = true) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          const marker = L.marker([lat, lon], { draggable: true, icon: pinIcon }).addTo(map);
          marker.on("dragend", () => {
            const p = marker.getLatLng();
            reverseGeocode(p.lat, p.lng);
          });
          markerRef.current = marker;
        }
        if (recenter) map.setView([lat, lon], Math.max(map.getZoom(), 15));
        reverseGeocode(lat, lon);
      };
      placeRef.current = place;

      if (hasPin) place(start.latitude!, start.longitude!, false);

      map.on("click", (e) => place(e.latlng.lat, e.latlng.lng, false));

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      placeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearchError(null);
    try {
      const { results } = await api<{ results: GeoResult[] }>(`/salon/me/geocode?q=${encodeURIComponent(query)}`);
      setResults(results);
      if (results.length === 0) setSearchError("No encontramos esa dirección. Prueba con más detalle o mueve el pin a mano.");
    } catch (e) {
      setSearchError(e instanceof ApiError ? e.message : "No pudimos buscar esa dirección.");
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r: GeoResult) => {
    setResults([]);
    setQuery("");
    placeRef.current?.(r.lat, r.lon);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        placeRef.current?.(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10_000 }
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="Busca tu dirección o el nombre de tu zona…"
            className="input-soft"
          />
          {results.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl border border-line bg-cream shadow-[var(--shadow-elevated)] max-h-56 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickResult(r)}
                  className="w-full text-left px-3 py-2.5 text-sm text-mauve-700 hover:bg-mauve-900/5 transition border-b border-line last:border-0"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleSearch} disabled={searching} className="btn btn-ghost h-10 px-4 text-sm disabled:opacity-50">
            {searching ? "Buscando…" : "Buscar"}
          </button>
          <button type="button" onClick={useMyLocation} disabled={locating} className="btn btn-ghost h-10 px-4 text-sm disabled:opacity-50" title="Usar mi ubicación actual">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
            {locating ? "Ubicando…" : "Mi ubicación"}
          </button>
        </div>
      </div>
      {searchError && <p className="mt-1.5 text-xs text-blush-500">{searchError}</p>}

      <div ref={mapElRef} className="mt-3 h-64 rounded-xl overflow-hidden border border-line" />
      <p className="mt-2 text-[11px] text-mauve-400">Toca el mapa o arrastra el pin para ajustar la ubicación exacta.</p>

      <div className="mt-3">
        <label className="text-xs uppercase tracking-wider text-mauve-400">Dirección (se muestra en tu página pública)</label>
        <input
          value={value.address ?? ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="Se completa sola al elegir el pin — puedes ajustarla"
          className="input-soft mt-1.5"
        />
      </div>
    </div>
  );
}
