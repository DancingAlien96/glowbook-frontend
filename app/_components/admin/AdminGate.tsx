"use client";

// Hidden entry point for the platform owner.
// Visiting /admin (or any /admin/* subroute) renders one of three states:
//   - anonymous   → AdminLoginForm (URL-only; no link from public site)
//   - wrong role  → minimal "not for your account" screen with logout
//   - ADMIN       → the actual admin shell + children
// We deliberately don't redirect anonymous visitors to /login — keeps the
// admin entrance separate and avoids ever showing the platform credentials
// alongside the salon-owner demos.

import { useEffect, useState } from "react";
import { useAuth } from "../../_lib/auth";
import { ApiError } from "../../_lib/api";
import AdminShell from "./AdminShell";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { status, user, logout } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0E0710]">
        <div className="flex flex-col items-center gap-3 text-mauve-400">
          <span className="h-9 w-9 rounded-full border-2 border-mauve-400/20 border-t-mauve-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider">Cargando…</span>
        </div>
      </div>
    );
  }

  if (status === "anonymous") {
    return <AdminLoginForm />;
  }

  if (user && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0E0710] px-6">
        <div className="max-w-md text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-mauve-400/70">Plataforma</div>
          <h1 className="mt-3 font-serif text-3xl text-cream">Acceso restringido</h1>
          <p className="mt-3 text-sm text-mauve-400 leading-relaxed">
            Esta sección es exclusiva para el equipo de Ecodama. Tu cuenta
            actual ({user.email}) no tiene los permisos necesarios.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <a href="/dashboard" className="btn btn-ghost h-11 text-sm bg-white/5 border-white/15 text-cream hover:bg-white/10">
              Ir a mi panel
            </a>
            <button onClick={logout} className="btn btn-outline h-11 text-sm border-white/30 text-cream hover:bg-white hover:text-mauve-900">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

function AdminLoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Block search indexing while this view is mounted — the admin path should
  // not be discoverable via Google.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      // AuthProvider flips status to "authenticated"; AdminGate re-renders.
      // If the user isn't ADMIN, the "wrong role" branch will show instead.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#0E0710] px-6 py-10 relative overflow-hidden">
      {/* Glows más presentes — fondo sigue negro pero con vida */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[42rem] rounded-full bg-mauve-800/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 h-72 w-72 rounded-full bg-blush-500/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-400/30 text-gold-300 text-[10px] uppercase tracking-[0.35em] font-medium">
            <span className="h-1 w-1 rounded-full bg-gold-300" />
            Ecodama · Plataforma
          </div>
          <h1 className="mt-4 font-serif text-3xl text-cream">Acceso interno</h1>
          <p className="mt-2 text-sm text-cream/75">Panel reservado al equipo de Ecodama.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
        >
          <div>
            <label className="text-[11px] uppercase tracking-wider text-cream/90 font-medium">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full h-11 rounded-xl bg-black/40 border border-white/20 px-3 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold-400 focus:bg-black/50 focus:ring-2 focus:ring-gold-400/20 transition"
              placeholder="tu@email.com"
            />
          </div>
          <div className="mt-4">
            <label className="text-[11px] uppercase tracking-wider text-cream/90 font-medium">Contraseña</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full h-11 rounded-xl bg-black/40 border border-white/20 px-3 text-sm text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold-400 focus:bg-black/50 focus:ring-2 focus:ring-gold-400/20 transition"
            />
          </div>

          {error && (
            <div className="mt-4 text-xs text-blush-200 bg-blush-500/20 border border-blush-400/40 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-11 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-mauve-900 font-semibold text-sm hover:brightness-110 hover:shadow-[0_8px_24px_-8px_rgba(203,146,61,0.6)] transition disabled:opacity-60"
          >
            {loading ? "Verificando…" : "Entrar al panel"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-cream/60 tracking-[0.2em] uppercase">
          Ecodama · Acceso registrado
        </p>
      </div>
    </div>
  );
}
