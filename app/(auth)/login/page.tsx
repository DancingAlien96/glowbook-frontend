"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../_lib/auth";
import { ApiError } from "../../_lib/api";
import { defaultRouteForRole } from "../../_components/auth/RequireAuth";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const { login, status, user } = useAuth();

  const [email, setEmail] = useState("isabella@maisonrose.app");
  const [password, setPassword] = useState("glowbook123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(next || defaultRouteForRole(user.role));
    }
  }, [status, user, next, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      // Redirect happens via the effect once `user` is populated.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated p-8 anim-fade-up">
      <div className="text-center">
        <span className="chip chip-gold">Bienvenida de vuelta</span>
        <h1 className="mt-4 font-serif text-3xl text-mauve-900">Inicia sesión</h1>
        <p className="mt-2 text-sm text-mauve-600">Accede al panel de tu salón.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-mauve-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-soft mt-1.5"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-mauve-400">Contraseña</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-soft mt-1.5"
          />
        </div>

        {error && (
          <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full h-12 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-mauve-600">
        ¿Aún no tienes salón?{" "}
        <Link href="/register" className="text-mauve-900 underline-offset-4 hover:underline font-medium">
          Crea tu cuenta
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-line">
        <p className="text-[11px] uppercase tracking-wider text-mauve-400 mb-2 text-center">Cuentas demo · password glowbook123</p>
        <div className="grid gap-1.5">
          {[
            { label: "Admin", email: "admin@glowbook.app" },
            { label: "Dueña", email: "isabella@maisonrose.app" },
            { label: "Estilista", email: "valentina@maisonrose.app" },
            { label: "Estilista", email: "camila@maisonrose.app" },
            { label: "Estilista", email: "sofia@maisonrose.app" },
          ].map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => { setEmail(d.email); setPassword("glowbook123"); }}
              className="text-left rounded-xl bg-cream-soft hover:bg-cream-soft/80 px-3 py-2 flex items-center justify-between transition"
            >
              <span className="text-xs text-mauve-600 font-mono truncate">{d.email}</span>
              <span className="chip chip-cream text-[10px]">{d.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
