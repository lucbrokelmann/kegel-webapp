"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-accent p-12 md:flex">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0 / 0.14) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 3c1 2 1 3 0 5-1 2-1 3 0 5s1 3 0 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="19" r="1.6" fill="#fff" />
            </svg>
          </div>
          <div className="font-display text-[17px] font-extrabold text-white">Kegelclub</div>
        </div>
        <div className="relative flex justify-center py-5">
          <svg width="170" height="170" viewBox="0 0 100 100" fill="none">
            <ellipse cx="50" cy="88" rx="30" ry="5" fill="oklch(1 0 0 / 0.12)" />
            <path
              d="M50 8c5 9 5 13 0 20-5 7-5 11 0 18s5 11 0 18-5 11 0 18"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.9"
            />
            <ellipse cx="50" cy="72" rx="13" ry="6" stroke="#fff" strokeWidth="2.4" opacity="0.9" />
            <circle cx="76" cy="80" r="10" stroke="#fff" strokeWidth="3" opacity="0.9" />
            <circle cx="73" cy="77" r="1.6" fill="#fff" />
            <circle cx="79" cy="77" r="1.6" fill="#fff" />
            <circle cx="76" cy="83" r="1.6" fill="#fff" />
          </svg>
        </div>
        <div className="relative">
          <div className="max-w-[380px] font-display text-[22px] font-bold leading-snug text-white">
            Anwesenheit, Termine und Strafenkasse – an einem Ort.
          </div>
          <div className="mt-3 text-sm text-white/70">Verwaltungstool für unseren Kegelclub</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <form action={formAction} className="flex w-full max-w-[360px] flex-col gap-5">
          <div>
            <div className="font-display text-2xl font-extrabold text-foreground">Willkommen zurück</div>
            <div className="mt-1.5 text-sm text-muted">Bitte mit dem Club-Passwort anmelden.</div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Club-Passwort</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                autoFocus
                className="w-full rounded-lg border border-border-strong px-3 py-2.5 pr-10 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 6 10 7 0 .5-.7 1.8-2.1 3.2M6.6 6.6C3.9 8.3 2 11.2 2 12c0 1 4 7 10 7 1.7 0 3.2-.4 4.5-1.1" />
                    <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "Prüfe…" : "Anmelden"}
          </button>

          <div className="text-center text-xs text-muted">Kegelclub Verwaltung · nur für Mitglieder</div>
        </form>
      </div>
    </div>
  );
}
