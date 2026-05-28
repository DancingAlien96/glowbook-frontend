"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "../shared/Logo";
import { useAuth } from "../../_lib/auth";
import { defaultRouteForRole } from "../auth/RequireAuth";
import type { UserRole } from "../../_lib/types";

const links = [
  { href: "#features", label: "Funciones" },
  { href: "#how", label: "Cómo funciona" },
  { href: "#mockups", label: "Producto" },
  { href: "#pricing", label: "Planes" },
  { href: "#faq", label: "FAQ" },
];

// Label that fits each role for the "go to my area" CTA when already signed in.
const PANEL_LABEL: Record<UserRole, string> = {
  OWNER: "Ir a mi panel",
  STAFF: "Ir a mi panel",
  STYLIST: "Ir a mi portal",
  ADMIN: "Plataforma",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { status, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Render auth area based on session state. While "loading" we render an
  // empty slot of the same width so the navbar doesn't jump when auth resolves.
  const panelHref = defaultRouteForRole(user?.role);
  const panelLabel = user?.role ? PANEL_LABEL[user.role] : "Ir a mi panel";
  const firstName = user?.name?.split(" ")[0];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container-tight">
        <nav
          className={`flex items-center justify-between rounded-full px-4 sm:px-6 transition-all duration-300 ${
            scrolled
              ? "glass-strong h-16 shadow-[0_10px_40px_-20px_rgba(56,39,47,0.25)]"
              : "h-20 bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center">
            <Logo className={`w-auto transition-all duration-300 ${scrolled ? "h-12" : "h-16"}`} />
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="px-3.5 py-2 text-sm text-mauve-600 hover:text-mauve-900 transition-colors rounded-full hover:bg-mauve-900/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Auth CTAs — desktop only; on mobile they live in the menu.
                Wrapped in a hidden/lg:flex container so the .btn display
                rule doesn't fight the responsive hide. Switches to a single
                "go to my panel" button when a session is already active. */}
            <div className="hidden lg:flex items-center gap-2 min-w-[260px] justify-end">
              {status === "loading" ? null : status === "authenticated" && user ? (
                <>
                  {firstName && (
                    <span className="text-sm text-mauve-600 mr-1">
                      Hola, <strong className="text-mauve-900 font-medium">{firstName}</strong>
                    </span>
                  )}
                  <Link href={panelHref} className="btn btn-primary h-10 px-4 text-sm">
                    {panelLabel}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-ghost h-10 px-4 text-sm">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" className="btn btn-primary h-10 px-4 text-sm">
                    Comenzar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full bg-mauve-900/5"
              aria-label="Menú"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>

        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-4 anim-fade-up">
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 text-sm text-mauve-700 hover:bg-mauve-900/5 rounded-xl"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-line">
              {status === "loading" ? (
                <div className="h-10" />
              ) : status === "authenticated" && user ? (
                <>
                  {firstName && (
                    <div className="text-xs text-mauve-500 mb-2 px-1">
                      Sesión activa como <strong className="text-mauve-900">{firstName}</strong>
                    </div>
                  )}
                  <Link
                    href={panelHref}
                    onClick={() => setOpen(false)}
                    className="btn btn-primary h-10 text-sm w-full"
                  >
                    {panelLabel}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </Link>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="btn btn-ghost h-10 text-sm">Iniciar sesión</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary h-10 text-sm">Comenzar</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
