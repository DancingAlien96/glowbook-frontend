"use client";

import Link from "next/link";
import { useAuth } from "../../_lib/auth";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { user } = useAuth();
  const slug = user?.salon?.slug;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-cream/80 backdrop-blur-xl">
      <div className="h-full px-4 sm:px-8 flex items-center gap-4">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Abrir menú"
          className="lg:hidden h-10 w-10 -ml-1 rounded-full bg-mauve-900/5 grid place-items-center text-mauve-700 hover:bg-mauve-900/10 transition shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>

        <div className="flex-1" />

        {slug && (
          <Link
            href={`/book/${slug}`}
            target="_blank"
            data-tour="public-page"
            className="btn btn-ghost h-9 text-xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M14 10l7-7M10 21H4a1 1 0 01-1-1v-6"/></svg>
            Mi página pública
          </Link>
        )}
      </div>
    </header>
  );
}
