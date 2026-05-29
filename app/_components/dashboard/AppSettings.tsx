"use client";

// Notifications + install-as-app block for the Settings page.
// Renders together because both rely on the same Service Worker registration.

import { useEffect, useState } from "react";
import {
  getCurrentPushSubscription,
  getNotificationPermission,
  isIos,
  isPushSupported,
  isServiceWorkerSupported,
  isStandalone,
  listenInstallability,
  promptInstall,
  registerServiceWorker,
  subscribeToPush,
  unsubscribeFromPush,
} from "../../_lib/pwa";

export default function AppSettings() {
  // ─── Push state ──────────────────────────────────────────────────────
  const [pushReady, setPushReady] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [permission, setPermission] = useState<"unsupported" | "default" | "granted" | "denied">(
    "default"
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // ─── Install state ───────────────────────────────────────────────────
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
    setInstalled(isStandalone());
    setIos(isIos());

    // Ensure SW is registered before we ask anything.
    registerServiceWorker().then(async () => {
      const sub = await getCurrentPushSubscription();
      setPushOn(!!sub);
      setPushReady(true);
    });

    return listenInstallability(setCanInstall);
  }, []);

  const togglePush = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (pushOn) {
        const ok = await unsubscribeFromPush();
        if (ok) {
          setPushOn(false);
          setMsg("Notificaciones desactivadas en este dispositivo.");
        } else {
          setMsg("No pudimos desactivar las notificaciones.");
        }
      } else {
        const result = await subscribeToPush();
        if (result.status === "ok") {
          setPushOn(true);
          setPermission("granted");
          setMsg("¡Listo! Te avisaremos cuando algo pase.");
        } else if (result.status === "denied") {
          setPermission("denied");
          setMsg("Permiso bloqueado. Habilítalo desde la configuración del navegador.");
        } else if (result.status === "unsupported") {
          setMsg("Tu navegador no soporta notificaciones push.");
        } else {
          setMsg(result.error || "No pudimos activar las notificaciones.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const onInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") setMsg("¡Listo! Encuéntrala en tu pantalla de inicio.");
  };

  const pushSupported = isPushSupported();
  const swSupported = isServiceWorkerSupported();

  return (
    <div className="card-surface p-6 sm:p-7">
      <div className="flex items-center gap-2 mb-1">
        <span className="chip chip-lavender text-[10px]">App móvil</span>
      </div>
      <h2 className="font-serif text-xl text-mauve-900">Instalación y notificaciones</h2>
      <p className="text-sm text-mauve-500 mt-1">
        Instala Ecodama en tu celular como una app y recibe avisos en tiempo real.
      </p>

      {/* ── Install ──────────────────────────────────────────────────── */}
      <div className="mt-5 rounded-2xl border border-line p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Instalar app</div>
            <div className="font-serif text-base text-mauve-900 mt-0.5">
              {installed ? "Ya está instalada" : "Agrega Ecodama a tu inicio"}
            </div>
            <p className="text-xs text-mauve-500 mt-1 leading-relaxed">
              {installed
                ? "Estás usando la versión instalada. Las notificaciones funcionan mejor desde aquí."
                : ios
                ? "En iPhone abre Safari, toca el ícono Compartir y luego “Agregar a pantalla de inicio”."
                : "Se abrirá como una app independiente, sin barras del navegador."}
            </p>
          </div>
          {!installed && !ios && (
            <button
              type="button"
              onClick={onInstall}
              disabled={!canInstall}
              className="btn btn-primary h-10 text-sm shrink-0 disabled:opacity-50"
              title={canInstall ? "Instalar Ecodama" : "Aún no disponible (intenta refrescar)"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>
              Instalar
            </button>
          )}
          {installed && (
            <span className="chip status-confirmed text-[10px] shrink-0">Instalada</span>
          )}
        </div>
      </div>

      {/* ── Push ─────────────────────────────────────────────────────── */}
      <div className="mt-3 rounded-2xl border border-line p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-mauve-400">Notificaciones push</div>
            <div className="font-serif text-base text-mauve-900 mt-0.5">
              Avisos al instante en este dispositivo
            </div>
            <p className="text-xs text-mauve-500 mt-1 leading-relaxed">
              Nueva reserva, comprobante de pago subido y recordatorio 30 minutos antes de cada cita.
            </p>
            {permission === "denied" && (
              <p className="text-xs text-blush-500 mt-2">
                Permiso bloqueado. Ábrelo desde el candado de la barra del navegador → Notificaciones → Permitir.
              </p>
            )}
            {!swSupported && (
              <p className="text-xs text-blush-500 mt-2">Este navegador no soporta service workers.</p>
            )}
            {/* On iOS Safari, the PushManager API is hidden until the PWA is
                installed to the home screen. Show the proper install path
                instead of the misleading "doesn't support push" message. */}
            {swSupported && !pushSupported && ios && !installed && (
              <div className="mt-2 rounded-lg bg-blush-100/40 border border-blush-300/30 p-2.5">
                <p className="text-xs text-mauve-800 font-medium">📱 En iPhone, primero instala la app</p>
                <ol className="text-[11px] text-mauve-600 mt-1 ml-3 list-decimal space-y-0.5">
                  <li>Abre esta página en <strong>Safari</strong> (no Chrome iOS)</li>
                  <li>Toca <strong>Compartir</strong> 📤 → <strong>Agregar a pantalla de inicio</strong></li>
                  <li>Abre Ecodama desde el ícono nuevo (no desde Safari)</li>
                  <li>Vuelve aquí y activa las notificaciones</li>
                </ol>
              </div>
            )}
            {swSupported && !pushSupported && ios && installed && (
              <p className="text-xs text-blush-500 mt-2">
                Necesitas iOS 16.4 o superior para recibir notificaciones push.
              </p>
            )}
            {swSupported && !pushSupported && !ios && (
              <p className="text-xs text-blush-500 mt-2">
                Tu navegador no soporta notificaciones push.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={togglePush}
            disabled={!pushReady || !pushSupported || busy || permission === "denied"}
            className={`relative h-7 w-12 rounded-full transition shrink-0 ${
              pushOn ? "bg-mauve-900" : "bg-mauve-900/15"
            } disabled:opacity-50`}
            aria-pressed={pushOn}
            aria-label={pushOn ? "Desactivar notificaciones" : "Activar notificaciones"}
          >
            {/* Pure white + shadow-md so the knob is clearly visible against
                both the mauve-900 active state and the cream-soft card; left-1
                anchor gives symmetric 4px margins in both ends. */}
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                pushOn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Samsung / Xiaomi battery-optimization warning. Their custom Android
            skins (One UI, MIUI) kill PWA service workers aggressively when the
            app is in the background, so push only fires while the app is open.
            Standard Android (Pixel, motorola, etc) doesn't have this problem. */}
        {pushOn && (
          <div className="mt-3 rounded-xl bg-gold-300/10 border border-gold-400/25 p-3">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 text-gold-600 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <div className="min-w-0 text-[11px] leading-relaxed text-mauve-700">
                <strong className="text-mauve-900">¿Solo te llegan cuando tienes la app abierta?</strong>
                {" "}En Samsung, Xiaomi y Huawei tienes que desactivar la "optimización de batería" para Ecodama: Ajustes → Apps → Ecodama → Batería → <strong>Sin restricción</strong>. Es un detalle del fabricante, no del sistema.
              </div>
            </div>
          </div>
        )}
      </div>

      {msg && (
        <div className="mt-4 text-xs text-mauve-700 bg-cream-soft rounded-xl px-3 py-2.5 border border-line">
          {msg}
        </div>
      )}
    </div>
  );
}
