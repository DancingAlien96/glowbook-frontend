"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "../../_lib/auth";
import { ApiError } from "../../_lib/api";
import { defaultRouteForRole } from "../../_components/auth/RequireAuth";
import PasswordInput from "../../_components/auth/PasswordInput";

export default function LoginPage() {
  // useSearchParams() must be inside a Suspense boundary for static export.
  return (
    <Suspense fallback={<div className="card-elevated p-8 h-72" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const { login, status, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <PasswordInput
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
    </div>
  );
}
