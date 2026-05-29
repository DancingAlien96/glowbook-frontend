"use client";

// Password input with an inline "show/hide" eye toggle. Used everywhere
// passwords are typed (login, register, admin gate, change password) so
// the user can verify what they're typing without committing first.
//
// Pass any className you'd normally put on a plain <input>; the wrapper
// adds padding-right to make room for the eye icon and absolutely
// positions the toggle button on the right.

import { useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Tone for the eye toggle icon. "light" suits cream backgrounds,
   *  "dark" suits the admin gate's near-black panel. */
  tone?: "light" | "dark";
};

export default function PasswordInput({ className = "", tone = "light", ...rest }: Props) {
  const [shown, setShown] = useState(false);

  const iconClasses =
    tone === "dark"
      ? "text-cream/50 hover:text-cream"
      : "text-mauve-400 hover:text-mauve-700";

  return (
    <div className="relative">
      <input
        {...rest}
        type={shown ? "text" : "password"}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        tabIndex={-1}
        aria-label={shown ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={shown}
        className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center transition rounded-md ${iconClasses}`}
      >
        {shown ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 104.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
