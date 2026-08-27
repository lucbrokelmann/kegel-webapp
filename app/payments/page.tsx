import { prisma } from "@/lib/prisma";
import { formatEuro } from "@/lib/stats";
import { toggleAttendancePaid } from "@/app/events/actions";

export default async function PaymentsPage() {
  const attendances = await prisma.attendance.findMany({
    where: { strafe: { gt: 0 } },
    include: { member: true, event: true },
    orderBy: { event: { date: "desc" } },
  });

  const byMember = new Map<
    number,
    { member: (typeof attendances)[number]["member"]; open: typeof attendances; openSum: number; paidSum: number }
  >();

  for (const a of attendances) {
    if (!byMember.has(a.memberId)) {
      byMember.set(a.memberId, { member: a.member, open: [], openSum: 0, paidSum: 0 });
    }
    const entry = byMember.get(a.memberId)!;
    if (a.paid) {
      entry.paidSum += Number(a.strafe);
    } else {
      entry.open.push(a);
      entry.openSum += Number(a.strafe);
    }
  }

  const debtors = [...byMember.values()].filter((e) => e.open.length > 0).sort((a, b) => b.openSum - a.openSum);
  const totalOpen = debtors.reduce((sum, d) => sum + d.openSum, 0);

  return (
    <>
      <div className="flex h-[72px] flex-shrink-0 items-center border-b border-border px-10">
        <div>
          <div className="font-display text-xl font-extrabold text-foreground">Zahlungen</div>
          <div className="mt-0.5 text-sm text-muted">Wer noch offene Strafen begleichen muss</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-10">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Offene Zahlungen gesamt</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{formatEuro(totalOpen)} €</div>
        </div>

        {debtors.length === 0 && (
          <div className="rounded-xl border border-border bg-surface py-8 text-center text-sm text-muted shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            Alle Strafen sind beglichen.
          </div>
        )}

        {debtors.map((entry) => (
          <div key={entry.member.id} className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="text-[15px] font-bold text-foreground">
                {entry.member.kegelname ?? entry.member.name}
              </div>
              <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-semibold text-danger">
                {formatEuro(entry.openSum)} € offen
              </span>
            </div>
            <table className="w-full border-collapse">
              <tbody>
                {entry.open.map((a) => (
                  <tr key={a.id}>
                    <td className="border-t border-border px-5 py-2.5 text-sm text-foreground">
                      {a.event.date.toLocaleDateString("de-DE")}
                      {a.event.notes ? ` — ${a.event.notes}` : ""}
                    </td>
                    <td className="border-t border-border px-5 py-2.5 text-sm text-foreground">{formatEuro(Number(a.strafe))} €</td>
                    <td className="border-t border-border px-5 py-2.5 text-right">
                      <form action={toggleAttendancePaid}>
                        <input type="hidden" name="eventId" value={a.eventId} />
                        <input type="hidden" name="memberId" value={a.memberId} />
                        <input type="hidden" name="paid" value={String(a.paid)} />
                        <button type="submit" className="text-[13px] font-semibold text-accent hover:underline">
                          Als bezahlt markieren
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
}
