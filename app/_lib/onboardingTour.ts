"use client";

// Guided onboarding for first-time owners. Uses driver.js to highlight key
// areas of the dashboard (sidebar items + topbar action) with a sequence of
// popovers themed to the Ecodama palette.
//
// Trigger points:
//   - DashboardChrome auto-fires startOnboardingIfFirstTime() on mount.
//   - Settings page exposes a "Repetir tour" button that calls
//     startOnboarding() unconditionally.

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_KEY = "gb.onboarded";

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function markOnboarded() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "1");
}

export function resetOnboarded() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// Mobile-specific drawer choreography. The sidebar lives behind the hamburger
// button on small screens (< lg = 1024px), so steps that point at sidebar
// items must open the drawer first. Steps that point at the topbar need it
// closed so it doesn't sit on top of the topbar overlay. DashboardChrome
// listens for these events and toggles its drawerOpen state accordingly.
const onMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
const openDrawer = () => {
  if (onMobile()) window.dispatchEvent(new Event("tour:open-drawer"));
};
const closeDrawer = () => {
  if (onMobile()) window.dispatchEvent(new Event("tour:close-drawer"));
};

/** Start the tour right away, regardless of the stored flag. */
export function startOnboarding(firstName?: string) {
  if (typeof window === "undefined") return;

  // Wait one frame so any pending route transition / sidebar render has
  // settled — otherwise driver.js may not find the highlighted element.
  requestAnimationFrame(() => {
    // Re-position the popover after the mobile drawer's 300ms slide-in so
    // it lands on the now-visible sidebar item instead of an off-screen one.
    const onSidebarStep = () => {
      openDrawer();
      if (onMobile()) setTimeout(() => tour.refresh(), 380);
    };
    const onTopbarStep = () => {
      closeDrawer();
      if (onMobile()) setTimeout(() => tour.refresh(), 380);
    };

    const tour = driver({
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Atrás",
      doneBtnText: "¡Listo!",
      animate: true,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 12,
      smoothScroll: true,
      onDestroyed: () => {
        // Make sure we don't leave the drawer open after closing the tour.
        closeDrawer();
        markOnboarded();
      },
      // Steps ordered so all sidebar-targeted items run consecutively, with
      // the topbar step at the end. This keeps the mobile drawer transitions
      // to just two: open at step 2, close at step 6.
      steps: [
        {
          popover: {
            title: `Bienvenida a Ecodama${firstName ? `, ${firstName}` : ""} ✨`,
            description:
              "Vamos a dejar tu salón listo para recibir reservas en menos de 3 minutos. Avanza con <strong>Siguiente</strong> o salta con la ×.",
          },
        },
        {
          element: '[data-tour="settings"]',
          onHighlightStarted: onSidebarStep,
          popover: {
            title: "1 · Personaliza tu salón",
            description:
              "Aquí pones el nombre, logo, horarios de atención y datos bancarios para recibir anticipos.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="services"]',
          onHighlightStarted: onSidebarStep,
          popover: {
            title: "2 · Crea tus servicios",
            description:
              "Cada servicio que ofreces: nombre, duración y precio. Las clientas eligen entre estos al reservar.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="team"]',
          onHighlightStarted: onSidebarStep,
          popover: {
            title: "3 · Invita a tu equipo",
            description:
              "Si trabajas con estilistas, agrégalas aquí. Si trabajas sola, puedes saltarte este paso — el sistema funciona igual.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="appointments"]',
          onHighlightStarted: onSidebarStep,
          popover: {
            title: "4 · Tu agenda",
            description:
              "Las reservas llegan acá automáticamente. Toca cualquier día para ver las citas, o crea una manualmente con <strong>Nueva cita</strong>.",
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="public-page"]',
          onHighlightStarted: onTopbarStep,
          popover: {
            title: "5 · Tu página pública",
            description:
              "Este botón abre la página que verán tus clientas. Cuando estés lista, comparte el link o el QR desde ahí.",
            side: "bottom",
            align: "end",
          },
        },
        {
          popover: {
            title: "¡Listo para recibir clientas! 💅",
            description:
              "Recuerda activar las notificaciones en <strong>Configuración → Instalación y notificaciones</strong> para que te avisemos al instante cuando alguien reserve.",
          },
        },
      ],
    });

    tour.drive();
  });
}

/** Fire the tour only if the user hasn't seen it yet. */
export function startOnboardingIfFirstTime(firstName?: string) {
  if (hasOnboarded()) return;
  startOnboarding(firstName);
}
