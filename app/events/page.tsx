import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createEvent } from "./actions";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: { attendances: true },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
        Kegeltermine
      </h1>

      <form action={createEvent} className="mb-6 flex gap-2">
        <input
          type="date"
          name="date"
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
        />
        <input
          type="text"
          name="notes"
          placeholder="Notiz (optional)"
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Neuer Termin
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {events.map((event) => {
          const presentCount = event.attendances.filter((a) => a.present).length;
          return (
            <li key={event.id} className="py-3">
              <Link href={`/events/${event.id}`} className="flex justify-between hover:underline">
                <span className="text-black dark:text-zinc-50">
                  {event.date.toLocaleDateString("de-DE")}
                  {event.notes ? ` — ${event.notes}` : ""}
                </span>
                <span className="text-zinc-500">{presentCount} anwesend</span>
              </Link>
            </li>
          );
        })}
        {events.length === 0 && (
          <li className="py-4 text-center text-zinc-500">Noch keine Termine angelegt.</li>
        )}
      </ul>
    </main>
  );
}
