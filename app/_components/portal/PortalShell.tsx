"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../shared/Logo";
import { useAuth } from "../../_lib/auth";
import { initials } from "../../_lib/format";

const nav = [
  { href: "/portal", label: "Hoy", icon: "✦" },
  { href: "/portal/schedule", label: "Mi semana", icon: "🗓" },
  { href: "/portal/profile", label: "Mi perfil", icon: "👤" },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-aurora-soft">
      {/* Top */}
      <header className="sticky top-0 z-40 border-b border-line bg-cream/80 backdrop-blur-xl">
        <div className="container-tight h-20 flex items-center gap-4">
          <Link href="/portal" className="flex items-center gap-2.5">
            <Logo className="h-14 w-auto" />
            <div className="leading-tight border-l border-line pl-3">
              <div className="text-[10px] uppercase tracking-wider text-mauve-400">Portal estilista</div>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 ml-6">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3.5 py-2 text-sm rounded-full transition ${
                    active ? "bg-mauve-900 text-cream" : "text-mauve-600 hover:bg-mauve-900/5"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2.5">
              <div className="text-right">
                <div className="text-sm font-medium text-mauve-900 leading-tight">{user?.name}</div>
                <div className="text-[10px] text-mauve-400">{user?.salon?.name}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif">
                {user ? initials(user.name) : "✦"}
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden border-t border-line bg-cream/50">
          <div className="container-tight flex">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex-1 text-center py-3 text-xs ${active ? "text-mauve-900 font-medium border-b-2 border-mauve-900" : "text-mauve-500"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="container-tight py-6 sm:py-8">{children}</main>
    </div>
  );
}
