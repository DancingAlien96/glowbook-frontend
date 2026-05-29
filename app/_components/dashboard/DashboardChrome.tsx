"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BillingBanner from "./BillingBanner";
import { registerServiceWorker } from "../../_lib/pwa";
import { startOnboardingIfFirstTime } from "../../_lib/onboardingTour";
import { useAuth } from "../../_lib/auth";

const COLLAPSE_KEY = "gb.sidebarCollapsed";

export default function DashboardChrome({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Remember the collapsed preference across visits.
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  // Register the SW once the owner enters the dashboard — enables PWA install
  // and push delivery. Safe to call on every mount (registration is idempotent).
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // First-time owner onboarding. Fires once per browser (localStorage flag);
  // the small delay lets the sidebar mount so the tour can find data-tour
  // anchors. Skipped automatically if the user has already seen it.
  useEffect(() => {
    if (!user || user.role !== "OWNER") return;
    const firstName = user.name?.split(" ")[0];
    const timeout = setTimeout(() => startOnboardingIfFirstTime(firstName), 600);
    return () => clearTimeout(timeout);
  }, [user]);

  // The onboarding tour dispatches these events when it needs to point at
  // sidebar items on mobile (drawer must be open) or at the topbar
  // (drawer must be closed). Decoupled via window events so the Settings
  // page's "Repetir tour" button works too without prop drilling.
  useEffect(() => {
    const open = () => setDrawerOpen(true);
    const close = () => setDrawerOpen(false);
    window.addEventListener("tour:open-drawer", open);
    window.addEventListener("tour:close-drawer", close);
    return () => {
      window.removeEventListener("tour:open-drawer", open);
      window.removeEventListener("tour:close-drawer", close);
    };
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <Topbar onMenu={() => setDrawerOpen(true)} />
        <BillingBanner />
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
