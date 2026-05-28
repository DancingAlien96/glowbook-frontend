"use client";

// Reusable "change password" card. Used in dashboard/settings (owner),
// admin/settings (platform owner) and portal/profile (stylist).
// On success: clears the form, shows a confirmation, and notes that other
// devices have been signed out (the server revokes their refresh tokens).

import { useMemo, useState } from "react";
import { api, ApiError } from "../../_lib/api";

type Tone = "light" | "dark";

export default function ChangePasswordCard({ tone = "light" }: { tone?: Tone }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Tiny strength heuristic so we can give the user a sense of progress.
  // Not a security guarantee — the real minimum is 8 chars (enforced server-side).
  const strength = useMemo(() => scoreStrength(next), [next]);

  const valid =
    current.length > 0 && next.length >= 8 && next === confirm && next !== current;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: { currentPassword: current, newPassword: next },
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setOk(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No pudimos actualizar tu contraseña.");
    } finally {
      setBusy(false);
    }
  };

  const t = tone === "dark" ? styles.dark : styles.light;

  return (
    <div className={t.card}>
      <div className="flex items-center gap-2 mb-1">
        <span className={t.chip}>Seguridad</span>
      </div>
      <h2 className={t.title}>Cambiar contraseña</h2>
      <p className={t.subtitle}>
        Tu sesión actual sigue activa. Cualquier otro dispositivo donde tengas la cuenta
        abierta se cerrará al guardar.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-3.5">
        <Field
          label="Contraseña actual"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={setCurrent}
          tone={tone}
        />
        <Field
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={setNext}
          minLength={8}
          tone={tone}
          hint="Mínimo 8 caracteres."
        />
        {next && <StrengthBar score={strength} tone={tone} />}
        <Field
          label="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
          minLength={8}
          tone={tone}
          error={confirm && confirm !== next ? "No coincide con la nueva contraseña." : undefined}
        />

        {error && <div className={t.error}>{error}</div>}
        {ok && <div className={t.success}>Contraseña actualizada. Las otras sesiones se cerraron.</div>}

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={!valid || busy} className={t.submit}>
            {busy ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  minLength,
  hint,
  error,
  tone,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  minLength?: number;
  hint?: string;
  error?: string;
  tone: Tone;
}) {
  const t = tone === "dark" ? styles.dark : styles.light;
  return (
    <div>
      <label className={t.label}>{label}</label>
      <input
        type={type}
        required
        autoComplete={autoComplete}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${t.input} mt-1.5`}
      />
      {error ? (
        <p className="mt-1 text-[11px] text-blush-500">{error}</p>
      ) : hint ? (
        <p className={`mt-1 text-[11px] ${tone === "dark" ? "text-mauve-400" : "text-mauve-400"}`}>{hint}</p>
      ) : null}
    </div>
  );
}

function StrengthBar({ score, tone }: { score: 0 | 1 | 2 | 3 | 4; tone: Tone }) {
  const labels = ["", "Débil", "Aceptable", "Buena", "Excelente"];
  const fills = [
    "bg-mauve-900/15",
    "bg-blush-400",
    "bg-gold-400",
    "bg-gold-500",
    "bg-[#2F7B4D]",
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition ${i <= score ? fills[score] : tone === "dark" ? "bg-white/10" : "bg-mauve-900/10"}`}
          />
        ))}
      </div>
      <span className={`text-[10px] uppercase tracking-wider ${tone === "dark" ? "text-mauve-400" : "text-mauve-500"}`}>
        {labels[score] || ""}
      </span>
    </div>
  );
}

function scoreStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4) as 0 | 1 | 2 | 3 | 4;
}

// ─── Style tokens (light = salon panel, dark = admin panel) ──────────────
const styles = {
  light: {
    card: "card-surface p-6 sm:p-7",
    chip: "chip chip-lavender text-[10px]",
    title: "font-serif text-xl text-mauve-900",
    subtitle: "text-sm text-mauve-500 mt-1",
    label: "text-[11px] uppercase tracking-wider text-mauve-400",
    input:
      "w-full h-11 rounded-xl bg-cream border border-line px-3 text-sm text-mauve-900 focus:outline-none focus:border-gold-400 transition",
    error:
      "text-sm text-blush-500 bg-blush-100/60 border border-blush-300/30 rounded-xl px-3 py-2.5",
    success:
      "text-sm text-mauve-800 bg-cream-soft border border-line rounded-xl px-3 py-2.5",
    submit:
      "btn btn-primary h-11 text-sm px-5 disabled:opacity-60 disabled:cursor-not-allowed",
  },
  dark: {
    card:
      "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 sm:p-7",
    chip:
      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider bg-gold-500/15 text-gold-300",
    title: "font-serif text-xl text-cream",
    subtitle: "text-sm text-mauve-400 mt-1",
    label: "text-[11px] uppercase tracking-wider text-mauve-400",
    input:
      "w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-cream placeholder:text-mauve-400/50 focus:outline-none focus:border-gold-400/60 focus:bg-black/40 transition",
    error:
      "text-sm text-blush-300 bg-blush-500/10 border border-blush-400/20 rounded-xl px-3 py-2.5",
    success:
      "text-sm text-gold-300 bg-gold-500/10 border border-gold-400/20 rounded-xl px-3 py-2.5",
    submit:
      "h-11 px-5 rounded-xl text-sm bg-gradient-to-r from-gold-500 to-gold-400 text-mauve-900 font-medium hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed",
  },
};
