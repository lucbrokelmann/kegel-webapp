import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveAttendance, toggleAttendancePresent } from "../actions";

const ATTENDANCE_FORM_ID = "attendance-form";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  const [event, members] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.member.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { attendances: { where: { eventId } } },
    }),
  ]);

  if (!event) notFound();

  const presentStrafes = members
    .map((m) => m.attendances[0])
    .filter((a) => a?.present)
    .map((a) => Number(a!.strafe));
  const avgStrafe =
    presentStrafes.length > 0
      ? Math.round((presentStrafes.reduce((sum, s) => sum + s, 0) / presentStrafes.length) * 100) / 100
      : 0;

  return (
    <>
      <div className="flex min-h-[72px] flex-shrink-0 flex-col justify-center border-b border-border px-10 py-3.5">
        <Link href="/events" className="text-xs font-semibold text-muted hover:text-accent">
          &#8249; Kegeltermine
        </Link>
        <div className="mt-1 font-display text-xl font-extrabold text-foreground">
          Termin {event.date.toLocaleDateString("de-DE")}
        </div>
        <div className="mt-0.5 text-sm text-muted">{event.notes ?? "–"}</div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-10">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Durchschnittsstrafe (anwesende Mitglieder)</div>
          <div className="mt-2 font-display text-2xl font-extrabold text-foreground">{avgStrafe.toFixed(2).replace(".", ",")} €</div>
        </div>

        {/* Strafe + Bezahlt are batched here and only persist on "Speichern". Anwesend saves instantly per row (see below). */}
        <form id={ATTENDANCE_FORM_ID} action={saveAttendance}>
          <input type="hidden" name="eventId" value={event.id} />
        </form>

        <div className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Mitglied</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Anwesend</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Strafe (€)</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Bezahlt</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const attendance = member.attendances[0];
                const isPresent = attendance?.present ?? false;
                return (
                  <tr key={member.id}>
                    <td className="border-b border-border px-5 py-2.5 text-sm font-semibold text-foreground last:border-none">
                      <input type="hidden" name="memberId" value={member.id} form={ATTENDANCE_FORM_ID} />
                      {member.kegelname ?? member.name}
                    </td>
                    <td className="border-b border-border px-5 py-2.5 last:border-none">
                      <form action={toggleAttendancePresent}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="memberId" value={member.id} />
                        <input type="hidden" name="present" value={String(isPresent)} />
                        <button
                          type="submit"
                          className={`relative inline-flex h-[22px] w-10 cursor-pointer items-center rounded-full border transition-colors ${
                            isPresent ? "border-success bg-success-soft" : "border-border-strong bg-surface-sunken"
                          }`}
                          aria-pressed={isPresent}
                          aria-label="Anwesenheit umschalten"
                        >
                          <span
                            className={`absolute h-4 w-4 rounded-full transition-all ${
                              isPresent ? "left-[20px] bg-success" : "left-0.5 bg-muted"
                            }`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="border-b border-border px-5 py-2.5 last:border-none">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        name={`strafe-${member.id}`}
                        form={ATTENDANCE_FORM_ID}
                        defaultValue={isPresent ? Number(attendance!.strafe) : avgStrafe}
                        disabled={!isPresent}
                        className="w-24 rounded-lg border border-border-strong px-2.5 py-1.5 text-sm outline-none focus:border-accent disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted"
                      />
                      {!isPresent && <div className="mt-1 text-xs text-muted">Ø automatisch</div>}
                    </td>
                    <td className="border-b border-border px-5 py-2.5 last:border-none">
                      <label className="relative inline-flex h-[22px] w-10 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          name={`paid-${member.id}`}
                          form={ATTENDANCE_FORM_ID}
                          defaultChecked={attendance?.paid ?? false}
                          className="peer sr-only"
                        />
                        <span className="absolute inset-0 rounded-full border border-border-strong bg-surface-sunken transition-colors peer-checked:border-success peer-checked:bg-success-soft" />
                        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-muted transition-all peer-checked:left-[20px] peer-checked:bg-success" />
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted">
          Der Anwesend-Schalter speichert sofort. Abwesende Mitglieder erhalten automatisch die Durchschnittsstrafe der
          anwesenden Mitglieder dieses Termins.
        </p>

        <button
          type="submit"
          form={ATTENDANCE_FORM_ID}
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Speichern
        </button>
      </div>
    </>
  );
}
