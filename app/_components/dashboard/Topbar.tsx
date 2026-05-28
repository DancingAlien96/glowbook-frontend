"use client";

import { useState } from "react";
import { useAuth } from "../../_lib/auth";
import ShareSalonModal from "./ShareSalonModal";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { user } = useAuth();
  const salon = user?.salon;
  const [shareOpen, setShareOpen] = useState(false);

  // Build the public URL on the client so it reflects the actual host
  // (Vercel preview, local dev, custom domain) — no env wiring needed.
  const publicUrl =
    salon && typeof window !== "undefined"
      ? `${window.location.origin}/book/${salon.slug}`
      : "";

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

        {salon && (
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="btn btn-ghost h-9 text-xs"
            title="Compartir mi salón"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
            <span className="hidden sm:inline">Compartir mi salón</span>
            <span className="sm:hidden">Compartir</span>
          </button>
        )}
      </div>

      {shareOpen && salon && (
        <ShareSalonModal
          url={publicUrl}
          salonName={salon.name}
          onClose={() => setShareOpen(false)}
        />
      )}
    </header>
  );
}
