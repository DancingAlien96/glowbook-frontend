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

function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const salon = user?.salon;

  return (
    <>
      <div className={`h-20 flex items-center border-b border-line shrink-0 ${collapsed ? "justify-center px-2" : "px-6"}`}>
        <Logo className={collapsed ? "h-10 w-auto" : "h-14 w-auto"} />
      </div>

      <div className={collapsed ? "px-2 py-4" : "px-3 py-4"}>
        <div className={`card-surface flex items-center ${collapsed ? "p-2 justify-center" : "p-3 gap-3"}`}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif shrink-0">
            {salon ? initials(salon.name) : "—"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-mauve-900 truncate">{salon?.name ?? "Tu salón"}</div>
              <div className="text-[11px] text-mauve-400 truncate">{salon ? `ecodama.online/${salon.slug}` : "—"}</div>
            </div>
          )}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto pb-6 ${collapsed ? "px-2" : "px-3"}`}>
        {nav.map((section) => (
          <div key={section.section} className="mt-3">
            {!collapsed && (
              <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-mauve-400 font-medium">
                {section.section}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-xl text-sm transition-all ${
                        collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5"
                      } ${
                        active
                          ? "bg-gradient-to-r from-mauve-900 to-mauve-800 text-cream shadow-[0_8px_20px_-8px_rgba(56,39,47,0.4)]"
                          : "text-mauve-700 hover:bg-mauve-900/5"
                      }`}
                    >
                      <span className={active ? "text-cream" : "text-mauve-600"}>{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`pb-3 ${collapsed ? "px-2" : "px-3"}`}>
        {/* Email as a separate row so the logout label can never wrap.
            Hidden when the sidebar is in collapsed (icon-only) mode. */}
        {!collapsed && user?.email && (
          <div className="px-3 pb-1.5 text-[10px] text-mauve-400 truncate" title={user.email}>
            {user.email}
          </div>
        )}
        <button
          onClick={() => logout()}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`w-full flex items-center rounded-xl text-sm text-mauve-700 hover:bg-mauve-900/5 transition ${
            collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5"
          }`}
        >
          <IconLogout />
          {!collapsed && <span className="whitespace-nowrap">Cerrar sesión</span>}
        </button>

        {/* Collapse toggle — desktop only (provided via onToggleCollapse) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
            className={`mt-1 w-full flex items-center rounded-xl text-sm text-mauve-400 hover:text-mauve-700 hover:bg-mauve-900/5 transition ${
              collapsed ? "justify-center h-11" : "gap-3 px-3 py-2.5"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${collapsed ? "rotate-180" : ""}`}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {!collapsed && <span>Colapsar menú</span>}
          </button>
        )}
      </div>
    </>
  );
}

export default function Sidebar({
  open = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <>
      {/* Desktop: fixed sidebar (collapsible) */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 flex-col border-r border-line bg-ivory/70 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {/* Mobile: slide-in drawer (always full width) */}
      <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-mauve-900/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-ivory border-r border-line shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <SidebarContent onNavigate={onClose} />
        </aside>
      </div>
    </>
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
