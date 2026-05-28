"use client";

// Client helpers for PWA installation + Web Push subscription.
// Keep this module browser-only — every entry point guards `window`.

import { api } from "./api";

// ─── Service worker registration ─────────────────────────────────────────

let swRegistration: ServiceWorkerRegistration | null = null;
let swPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export function isServiceWorkerSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

export function isPushSupported() {
  return (
    isServiceWorkerSupported() &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) return null;
  if (swRegistration) return swRegistration;
  if (swPromise) return swPromise;

  swPromise = (async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      swRegistration = reg;
      return reg;
    } catch (err) {
      console.warn("[pwa] SW registration failed", err);
      return null;
    } finally {
      swPromise = null;
    }
  })();
  return swPromise;
}

// ─── Install prompt (beforeinstallprompt) ────────────────────────────────

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BIPEvent | null = null;
const installListeners = new Set<(canInstall: boolean) => void>();

export function isStandalone() {
  if (typeof window === "undefined") return false;
  // iOS Safari sets navigator.standalone; everyone else uses display-mode.
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  );
}

export function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function listenInstallability(fn: (canInstall: boolean) => void): () => void {
  installListeners.add(fn);
  // Fire current state on subscribe.
  fn(!!deferredPrompt);
  return () => installListeners.delete(fn);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BIPEvent;
    installListeners.forEach((fn) => fn(true));
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installListeners.forEach((fn) => fn(false));
  });
}

export async function promptInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installListeners.forEach((fn) => fn(false));
  return choice.outcome;
}

// ─── Web Push subscription ───────────────────────────────────────────────

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  // Allocate on a concrete ArrayBuffer (not SharedArrayBuffer) so the result
  // satisfies PushManager.subscribe's BufferSource type.
  const buf = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type PushStatus = "unsupported" | "denied" | "granted" | "default";

export function getNotificationPermission(): PushStatus {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission as PushStatus;
}

/** Returns the existing subscription, or null if the user hasn't subscribed. */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await registerServiceWorker();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<{
  status: "ok" | "denied" | "unsupported" | "error";
  error?: string;
}> {
  if (!isPushSupported()) return { status: "unsupported" };

  const reg = await registerServiceWorker();
  if (!reg) return { status: "unsupported" };

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { status: "denied" };

  try {
    // Fetch the server's VAPID public key (no auth required).
    const { publicKey } = await api<{ publicKey: string }>("/push/vapid", { auth: false });
    if (!publicKey) return { status: "error", error: "VAPID key missing" };

    // Reuse existing subscription if its applicationServerKey matches.
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    // Send to backend (authenticated — ties subscription to the logged-in user).
    await api("/push/subscribe", {
      method: "POST",
      body: {
        endpoint: sub.endpoint,
        keys: sub.toJSON().keys,
        userAgent: navigator.userAgent,
      },
    });

    return { status: "ok" };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await registerServiceWorker();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return true;
  try {
    await api("/push/unsubscribe", { method: "POST", body: { endpoint: sub.endpoint } });
  } catch {
    // Even if the server call fails, unsubscribing the browser is still useful.
  }
  return sub.unsubscribe();
}
