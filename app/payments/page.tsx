import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEuro } from "@/lib/stats";
import { toggleAttendancePaid } from "@/app/events/actions";

export const dynamic = "force-dynamic";

const VIEWS = [
  { value: "member", label: "Zahlung je Person" },
  { value: "event", label: "Zahlung je Termin" },
] as const;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: rawView } = await searchParams;
  const view = VIEWS.some((v) => v.value === rawView) ? rawView! : "member";

  const attendances = await prisma.attendance.findMany({
    where: { strafe: { gt: 0 } },
    include: { member: true, event: true },
    orderBy: { event: { date: "desc" } },
  });

  const byMember = new Map<
    number,
    { member: (typeof attendances)[number]["member"]; open: typeof attendances; openSum: number }
  >();
  const byEvent = new Map<
    number,
    { event: (typeof attendances)[number]["event"]; open: typeof attendances; openSum: number }
  >();

  for (const a of attendances) {
    if (a.paid) continue;

    if (!byMember.has(a.memberId)) {
      byMember.set(a.memberId, { member: a.member, open: [], openSum: 0 });
    }
    const memberEntry = byMember.get(a.memberId)!;
    memberEntry.open.push(a);
    memberEntry.openSum += Number(a.strafe);

    if (!byEvent.has(a.eventId)) {
      byEvent.set(a.eventId, { event: a.event, open: [], openSum: 0 });
    }
    const eventEntry = byEvent.get(a.eventId)!;
    eventEntry.open.push(a);
    eventEntry.openSum += Number(a.strafe);
  }

  const debtorsByMember = [...byMember.values()].sort((a, b) => b.openSum - a.openSum);
  const debtorsByEvent = [...byEvent.values()].sort((a, b) => b.event.date.getTime() - a.event.date.getTime());
  const totalOpen = debtorsByMember.reduce((sum, d) => sum + d.openSum, 0);
  const isEmpty = debtorsByMember.length === 0;

  return (
    <>
      <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-border px-10">
        <div>
          <div className="font-display text-xl font-extrabold text-foreground">Zahlungen</div>
          <div className="mt-0.5 text-sm text-muted">Wer noch offene Strafen begleichen muss</div>
        </div>
        <div className="inline-flex gap-0.5 rounded-lg border border-border bg-surface-sunken p-0.5">
          {VIEWS.map((v) => (
            <Link
              key={v.value}
              href={v.value === "member" ? "/payments" : `/payments?view=${v.value}`}
              className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold ${
                view === v.value ? "bg-surface text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-auto p-10">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Offene Zahlungen gesamt</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{formatEuro(totalOpen)} €</div>
        </div>

        {isEmpty && (
          <div className="rounded-xl border border-border bg-surface py-8 text-center text-sm text-muted shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
            Alle Strafen sind beglichen.
          </div>
        )}

        {view === "member" &&
          debtorsByMember.map((entry) => (
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
                        <ToggleForm a={a} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {view === "event" &&
          debtorsByEvent.map((entry) => (
            <div key={entry.event.id} className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
              <div className="flex items-center justify-between px-5 py-3.5">
                <div className="text-[15px] font-bold text-foreground">
                  {entry.event.date.toLocaleDateString("de-DE")}
                  {entry.event.notes ? ` — ${entry.event.notes}` : ""}
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
                        {a.member.kegelname ?? a.member.name}
                      </td>
                      <td className="border-t border-border px-5 py-2.5 text-sm text-foreground">{formatEuro(Number(a.strafe))} €</td>
                      <td className="border-t border-border px-5 py-2.5 text-right">
                        <ToggleForm a={a} />
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

function ToggleForm({ a }: { a: { eventId: number; memberId: number; paid: boolean } }) {
  return (
    <form action={toggleAttendancePaid}>
      <input type="hidden" name="eventId" value={a.eventId} />
      <input type="hidden" name="memberId" value={a.memberId} />
      <input type="hidden" name="paid" value={String(a.paid)} />
      <button type="submit" className="text-[13px] font-semibold text-accent hover:underline">
        Als bezahlt markieren
      </button>
    </form>
  );
}
