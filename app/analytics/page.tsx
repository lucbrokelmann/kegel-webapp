import { getClubOverview, formatEuro } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { memberStats, events, avgQuote, completedEventCount, totalStrafe, topMember } = await getClubOverview();

  const byQuote = [...memberStats].sort((a, b) => b.quote - a.quote);

  return (
    <>
      <div className="flex h-[72px] flex-shrink-0 items-center border-b border-border px-10">
        <div>
          <div className="font-display text-xl font-extrabold text-foreground">Analysen</div>
          <div className="mt-0.5 text-sm text-muted">Anwesenheit und Strafenkasse im Überblick</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Ø Anwesenheitsquote</div>
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{avgQuote}%</div>
            <div className="mt-1.5 text-xs text-muted">{completedEventCount} abgeschlossene Termine</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Strafenkasse</div>
            <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{formatEuro(totalStrafe)} €</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Aktivstes Mitglied</div>
            <div className="mt-2 font-display text-xl font-extrabold text-foreground">
              {topMember ? `${topMember.member.kegelname ?? topMember.member.name} – ${topMember.quote}%` : "–"}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <div className="px-5 pb-1 pt-4 font-display text-[15px] font-bold text-foreground">Anwesenheit pro Mitglied</div>
          {byQuote.map(({ member, quote, strafeSum }) => (
            <div key={member.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="w-[110px] flex-shrink-0 text-[13px] font-semibold text-foreground">
                {member.kegelname ?? member.name}
              </div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                <div className="h-full rounded-full bg-accent" style={{ width: `${quote}%` }} />
              </div>
              <div className="w-[70px] text-right text-[13px] font-bold text-foreground">{quote}%</div>
              <div className="w-[70px] text-right text-xs text-muted">{formatEuro(strafeSum)} €</div>
            </div>
          ))}
          {byQuote.length === 0 && <div className="px-5 py-5 text-center text-sm text-muted">Noch keine Mitglieder.</div>}
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <div className="px-5 pb-1 pt-4 font-display text-[15px] font-bold text-foreground">Anwesenheit pro Termin</div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border px-5 pb-2.5 pt-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Datum</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Anwesende</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Summe Strafen (€)</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const presentCount = event.attendances.filter((a) => a.present).length;
                const strafeSum = event.attendances.reduce((sum, a) => sum + Number(a.strafe), 0);
                return (
                  <tr key={event.id}>
                    <td className="border-b border-border px-5 py-2.5 text-sm text-foreground last:border-none">
                      {event.date.toLocaleDateString("de-DE")}
                    </td>
                    <td className="border-b border-border px-5 py-2.5 text-sm text-foreground last:border-none">{presentCount}</td>
                    <td className="border-b border-border px-5 py-2.5 text-sm text-foreground last:border-none">{formatEuro(strafeSum)}</td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-5 text-center text-sm text-muted">
                    Noch keine Termine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
