"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../shared/Logo";
import { useAuth } from "../../_lib/auth";
import { initials } from "../../_lib/format";

const nav = [
  {
    section: "Operación",
    items: [
      { href: "/dashboard", label: "Resumen", icon: <IconHome /> },
      { href: "/dashboard/appointments", label: "Calendario", icon: <IconCalendar /> },
      { href: "/dashboard/services", label: "Servicios", icon: <IconSparkle /> },
      { href: "/dashboard/clients", label: "Clientas", icon: <IconUsers /> },
      { href: "/dashboard/team", label: "Equipo", icon: <IconTeam /> },
    ],
  },
  {
    section: "Finanzas",
    items: [
      { href: "/dashboard/payments", label: "Pagos", icon: <IconWallet /> },
      { href: "/dashboard/billing", label: "Plan & factura", icon: <IconBilling /> },
      { href: "/dashboard/settings", label: "Ajustes", icon: <IconCog /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const salon = user?.salon;

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-line bg-ivory/70 backdrop-blur-xl">
      <div className="h-20 px-6 flex items-center border-b border-line">
        <Logo className="h-14 w-auto" />
      </div>

      <div className="px-3 py-4">
        <div className="card-surface p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif">
            {salon ? initials(salon.name) : "—"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-mauve-900 truncate">
              {salon?.name ?? "Tu salón"}
            </div>
            <div className="text-[11px] text-mauve-400 truncate">
              {salon ? `ecodama.online/${salon.slug}` : "—"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto pb-6">
        {nav.map((section) => (
          <div key={section.section} className="mt-3">
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-mauve-400 font-medium">
              {section.section}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? "bg-gradient-to-r from-mauve-900 to-mauve-800 text-cream shadow-[0_8px_20px_-8px_rgba(56,39,47,0.4)]"
                          : "text-mauve-700 hover:bg-mauve-900/5"
                      }`}
                    >
                      <span className={active ? "text-cream" : "text-mauve-600"}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-mauve-700 hover:bg-mauve-900/5 transition"
        >
          <IconLogout />
          <span className="flex-1 text-left">Cerrar sesión</span>
          <span className="text-[10px] text-mauve-400 truncate">{user?.email}</span>
        </button>
      </div>
    </aside>
  );
}

function IconHome() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-4V14h-7v7.5h-4A1.5 1.5 0 013 20v-9.5z"/></svg>;
}
function IconCalendar() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
}
function IconSparkle() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/><path d="M18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16z"/></svg>;
}
function IconUsers() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5M17 11a3 3 0 100-6"/><path d="M21 20c0-2.4-1.7-4.5-4-5.2"/></svg>;
}
function IconTeam() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8"/></svg>;
}
function IconWallet() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M16 14h2"/></svg>;
}
function IconBilling() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6M9 17h6"/></svg>;
}
function IconCog() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.7 1 1 1.5 1h.1a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
}
function IconLogout() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
}
