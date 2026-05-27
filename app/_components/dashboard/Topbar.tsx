"use client";

import Link from "next/link";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-cream/80 backdrop-blur-xl">
      <div className="h-full px-4 sm:px-8 flex items-center gap-4">
        <Link href="/" className="lg:hidden font-serif text-xl text-mauve-900">Ecodama</Link>

        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mauve-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            <input
              placeholder="Buscar clientas, servicios, citas…"
              className="input-soft pl-10 h-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] text-mauve-400">
              <kbd className="px-1.5 py-0.5 rounded-md bg-mauve-900/5 border border-line">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded-md bg-mauve-900/5 border border-line">K</kbd>
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Link href="/book/maison-rose" className="hidden md:inline-flex btn btn-ghost h-9 text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M14 10l7-7M10 21H4a1 1 0 01-1-1v-6"/></svg>
            Mi página
          </Link>
          <button className="relative h-10 w-10 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-blush-500 ring-2 ring-cream" />
          </button>
          <button className="btn btn-primary h-10 px-4 text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Nueva cita
          </button>
          <button className="h-10 w-10 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 grid place-items-center text-cream font-serif">
            I
          </button>
        </div>
      </div>
    </header>
  );
}
