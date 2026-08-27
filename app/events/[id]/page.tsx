import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveAttendance } from "../actions";

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

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-1 text-xl font-semibold text-black dark:text-zinc-50">
        Termin {event.date.toLocaleDateString("de-DE")}
      </h1>
      {event.notes && <p className="mb-4 text-zinc-500">{event.notes}</p>}

      <form action={saveAttendance} className="mt-4">
        <input type="hidden" name="eventId" value={event.id} />
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2">Mitglied</th>
              <th className="py-2">Anwesend</th>
              <th className="py-2">Strafe (€)</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const attendance = member.attendances[0];
              return (
                <tr key={member.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="py-2 text-black dark:text-zinc-50">
                    <input type="hidden" name="memberId" value={member.id} />
                    {member.kegelname ?? member.name}
                  </td>
                  <td className="py-2">
                    <input
                      type="checkbox"
                      name={`present-${member.id}`}
                      defaultChecked={attendance?.present ?? false}
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      name={`strafe-${member.id}`}
                      defaultValue={attendance ? Number(attendance.strafe) : 0}
                      className="w-24 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button
          type="submit"
          className="mt-4 rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Speichern
        </button>
      </form>
    </main>
  );
}
