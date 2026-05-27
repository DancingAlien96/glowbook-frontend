"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "../shared/Logo";

const links = [
  { href: "#features", label: "Funciones" },
  { href: "#how", label: "Cómo funciona" },
  { href: "#mockups", label: "Producto" },
  { href: "#pricing", label: "Planes" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

          <ul className="hidden md:flex items-center gap-1">
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

          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/dashboard" className="text-sm text-mauve-600 hover:text-mauve-900 px-3.5 py-2 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/dashboard" className="btn btn-primary h-10 px-4 text-sm">
              Comenzar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full bg-mauve-900/5"
            aria-label="Menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-4 anim-fade-up">
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
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-line">
              <Link href="/dashboard" className="btn btn-ghost h-10 text-sm">Iniciar sesión</Link>
              <Link href="/dashboard" className="btn btn-primary h-10 text-sm">Comenzar</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
