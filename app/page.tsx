import { getClubOverview, formatEuro, dayMonth } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { members, activeStats, totalEvents, completedEventCount, avgQuote, totalStrafe, upcomingEvents, leaderboard } =
    await getClubOverview();

  return (
    <>
      <div className="flex h-[72px] flex-shrink-0 items-center border-b border-border px-10">
        <div>
          <div className="font-display text-xl font-extrabold text-foreground">Übersicht</div>
          <div className="mt-0.5 text-sm text-muted">Willkommen zurück</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-10">
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Mitglieder gesamt</div>
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{members.length}</div>
            <div className="mt-1.5 text-xs font-semibold text-success">{activeStats.length} aktiv</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Termine gesamt</div>
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{totalEvents}</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Ø Anwesenheit</div>
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{avgQuote}%</div>
            <div className="mt-1.5 text-xs text-muted">{completedEventCount} abgeschlossene Termine</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Strafenkasse</div>
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{formatEuro(totalStrafe)} €</div>
          </div>
        </div>

        <div className="grid grid-cols-[1.7fr_1fr] gap-4">
          <div className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="flex items-center justify-between px-5 pb-1 pt-4">
              <div className="font-display text-[15px] font-bold text-foreground">Nächste Termine</div>
            </div>
            <div>
              {upcomingEvents.map((event) => {
                const { day, month } = dayMonth(event.date);
                const presentCount = event.attendances.filter((a) => a.present).length;
                return (
                  <div key={event.id} className="flex items-center gap-3.5 border-b border-border px-5 py-3.5 last:border-none">
                    <div className="flex h-[46px] w-[46px] flex-shrink-0 flex-col items-center justify-center rounded-[10px] bg-accent-soft font-display text-accent">
                      <b className="text-[15px] leading-none">{day}</b>
                      <span className="text-[9px] uppercase tracking-wide">{month}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-foreground">
                        {event.date.toLocaleDateString("de-DE")}
                      </div>
                      <div className="mt-0.5 text-xs text-muted">{event.notes ?? "–"}</div>
                    </div>
                    <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs font-semibold text-muted">
                      {presentCount > 0 ? `${presentCount} anwesend` : "offen"}
                    </span>
                  </div>
                );
              })}
              {upcomingEvents.length === 0 && (
                <div className="px-5 py-5 text-center text-sm text-muted">Keine anstehenden Termine.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="px-5 pb-1 pt-4 font-display text-[15px] font-bold text-foreground">Top Anwesenheit</div>
            <div className="pb-2">
              {leaderboard.map((entry, i) => (
                <div key={entry.member.id} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="w-5 font-display text-xs font-extrabold text-muted">{i + 1}</div>
                  <div className="w-[92px] flex-shrink-0 truncate text-[13px] font-semibold text-foreground">
                    {entry.member.kegelname ?? entry.member.name}
                  </div>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${entry.quote}%` }} />
                  </div>
                  <div className="w-9 text-right text-xs font-bold text-foreground">{entry.quote}%</div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="px-5 py-5 text-center text-sm text-muted">Noch keine Daten.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
