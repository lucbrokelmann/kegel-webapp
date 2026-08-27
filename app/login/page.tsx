"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          Kegelclub-Login
        </h1>
        <input
          type="password"
          name="password"
          placeholder="Club-Passwort"
          required
          autoFocus
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Prüfe…" : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
