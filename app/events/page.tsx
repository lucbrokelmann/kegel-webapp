import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createEvent } from "./actions";
import { dayMonth, formatEuro } from "@/lib/stats";

export default async function EventsPage() {
  const [events, activeMemberCount] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: "desc" }, include: { attendances: true } }),
    prisma.member.count({ where: { active: true } }),
  ]);

  return (
    <>
      <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-border px-10">
        <div>
          <div className="font-display text-xl font-extrabold text-foreground">Kegeltermine</div>
          <div className="mt-0.5 text-sm text-muted">{events.length} Termine</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-10">
        <form action={createEvent} className="flex gap-2 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <input
            type="date"
            name="date"
            required
            className="rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            name="notes"
            placeholder="Notiz (optional)"
            className="flex-1 rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
            Neuer Termin
          </button>
        </form>

        <div className="flex flex-col gap-3">
          {events.map((event) => {
            const { day, month } = dayMonth(event.date);
            const presentCount = event.attendances.filter((a) => a.present).length;
            const strafeSum = event.attendances.reduce((sum, a) => sum + Number(a.strafe), 0);
            const quote = activeMemberCount > 0 ? Math.round((presentCount / activeMemberCount) * 100) : 0;
            return (
              <div key={event.id} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4.5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
                <div className="flex h-[54px] w-[54px] flex-shrink-0 flex-col items-center justify-center rounded-xl bg-accent-soft font-display text-accent">
                  <b className="text-lg leading-none">{day}</b>
                  <span className="text-[10px] uppercase tracking-wide">{month}</span>
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-foreground">{event.date.toLocaleDateString("de-DE")}</div>
                  <div className="mt-0.5 text-[13px] text-muted">{event.notes ?? "–"}</div>
                </div>
                <div className="w-[130px]">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${quote}%` }} />
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    presentCount > 0 ? "bg-success-soft text-success" : "bg-surface-sunken text-muted"
                  }`}
                >
                  {presentCount > 0 ? `${presentCount} anwesend, ${formatEuro(strafeSum)} €` : "offen"}
                </span>
                <Link href={`/events/${event.id}`} className="flex-shrink-0 text-[13px] font-semibold no-underline hover:underline">
                  Öffnen &#8250;
                </Link>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="rounded-xl border border-border bg-surface py-6 text-center text-sm text-muted">
              Noch keine Termine angelegt.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
