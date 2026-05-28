// Ecodama service worker — push notifications + PWA shell.
// Versioned cache: bump CACHE_VERSION to invalidate old caches on deploy.
const CACHE_VERSION = "ecodama-v1";
const ICON = "/ecodamalogo.png";

self.addEventListener("install", (event) => {
  // Activate the new SW immediately on first install.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll([ICON]))
  );
});

self.addEventListener("activate", (event) => {
  // Take control of open clients and purge old caches.
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
      ),
    ])
  );
});

// We deliberately do NOT intercept fetch for API/auth routes — Next.js + the
// API client need fresh responses. Only static assets get a cache-first pass.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isStatic =
    isSameOrigin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname === "/ecodamalogo.png" ||
      url.pathname === "/manifest.webmanifest");

  if (!isStatic || event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      } catch {
        return cached ?? Response.error();
      }
    })
  );
});

// Push: backend sends JSON { title, body, url?, tag?, badge? }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Ecodama", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Ecodama";
  const options = {
    body: data.body || "",
    icon: ICON,
    badge: ICON,
    tag: data.tag || "ecodama",
    renotify: !!data.tag,
    data: { url: data.url || "/dashboard" },
    vibrate: [80, 40, 80],
    // Don't auto-close on Android — owner should see it explicitly.
    requireInteraction: data.requireInteraction === true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click: focus an existing window pointing to the dashboard, or open a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            client.focus();
            return client.navigate(targetUrl);
          }
        } catch {
          /* ignore */
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
