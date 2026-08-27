import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const [members, events] = await Promise.all([
    prisma.member.findMany({
      orderBy: { name: "asc" },
      include: { attendances: true },
    }),
    prisma.event.findMany({
      orderBy: { date: "desc" },
      include: { attendances: true },
    }),
  ]);

  const totalEvents = events.length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-10 p-6">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Analysen</h1>

      <section>
        <h2 className="mb-2 font-medium text-black dark:text-zinc-50">Pro Spieler</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2">Mitglied</th>
              <th className="py-2">Anwesenheitsquote</th>
              <th className="py-2">Summe Strafen (€)</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const presentCount = member.attendances.filter((a) => a.present).length;
              const quote = totalEvents > 0 ? Math.round((presentCount / totalEvents) * 100) : 0;
              const strafeSum = member.attendances.reduce((sum, a) => sum + Number(a.strafe), 0);
              return (
                <tr key={member.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 text-black dark:text-zinc-50">{member.kegelname ?? member.name}</td>
                  <td className="py-2">{quote}%</td>
                  <td className="py-2">{strafeSum.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 font-medium text-black dark:text-zinc-50">Pro Termin</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2">Datum</th>
              <th className="py-2">Anwesende</th>
              <th className="py-2">Summe Strafen (€)</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const presentCount = event.attendances.filter((a) => a.present).length;
              const strafeSum = event.attendances.reduce((sum, a) => sum + Number(a.strafe), 0);
              return (
                <tr key={event.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 text-black dark:text-zinc-50">{event.date.toLocaleDateString("de-DE")}</td>
                  <td className="py-2">{presentCount}</td>
                  <td className="py-2">{strafeSum.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
