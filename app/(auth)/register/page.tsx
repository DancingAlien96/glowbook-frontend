"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../_lib/auth";
import { ApiError } from "../../_lib/api";
import PasswordInput from "../../_components/auth/PasswordInput";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

export default function RegisterPage() {
  const router = useRouter();
  const { register, status } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    salonName: "",
    salonSlug: "",
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "salonName" && !slugTouched) next.salonSlug = slugify(v);
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        ...form,
        salonSlug: form.salonSlug || slugify(form.salonName),
      });
      router.replace("/dashboard/billing");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos crear tu cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated p-8 anim-fade-up">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2 opacity-40">
          <span className="h-6 w-6 rounded-full bg-mauve-900 text-cream text-[11px] font-semibold flex items-center justify-center shrink-0">1</span>
          <span className="text-xs text-mauve-700 hidden sm:block">Tarjeta en Recurrente</span>
        </div>
        <svg className="text-mauve-300 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-mauve-900 text-cream text-[11px] font-semibold flex items-center justify-center shrink-0">2</span>
          <span className="text-xs font-medium text-mauve-900 hidden sm:block">Crea tu cuenta</span>
        </div>
        <svg className="text-mauve-300 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        <div className="flex items-center gap-2 opacity-40">
          <span className="h-6 w-6 rounded-full bg-mauve-100 text-mauve-500 text-[11px] font-semibold flex items-center justify-center shrink-0">3</span>
          <span className="text-xs text-mauve-500 hidden sm:block">Empieza a usar</span>
        </div>
      </div>

      <div className="text-center">
        <h1 className="font-serif text-3xl text-mauve-900">Crea tu salón</h1>
        <p className="mt-2 text-sm text-mauve-500">
          Usa el <strong className="text-mauve-700">mismo email</strong> que ingresaste en Recurrente y tu prueba queda activa al instante.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-mauve-400">Tu nombre</label>
          <input required minLength={2} value={form.name} onChange={update("name")} className="input-soft mt-1.5" placeholder="Isabella Rojas" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-mauve-400">Email</label>
          <input type="email" required value={form.email} onChange={update("email")} className="input-soft mt-1.5" placeholder="tu@email.com" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-mauve-400">Contraseña</label>
          <PasswordInput required minLength={8} value={form.password} onChange={update("password")} autoComplete="new-password" className="input-soft mt-1.5" placeholder="Mínimo 8 caracteres" />
        </div>
        <div className="pt-2 border-t border-line">
          <label className="text-xs uppercase tracking-wider text-mauve-400">Nombre del salón</label>
          <input required minLength={2} value={form.salonName} onChange={update("salonName")} className="input-soft mt-1.5" placeholder="Ej. Maison Rosé" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-mauve-400">URL pública</label>
          <div className="mt-1.5 flex items-center rounded-2xl border border-line-strong bg-ivory overflow-hidden">
            <span className="px-3 text-xs text-mauve-400 font-mono">ecodama.online/</span>
            <input
              required
              minLength={3}
              value={form.salonSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, salonSlug: slugify(e.target.value) }));
              }}
              className="bg-transparent flex-1 px-2 py-3 text-sm text-mauve-900 outline-none font-mono"
              placeholder="maison-rose"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full h-12 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Creando tu salón…" : "Crear cuenta y empezar"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-mauve-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-mauve-900 underline-offset-4 hover:underline font-medium">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
