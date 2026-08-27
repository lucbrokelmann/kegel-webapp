import { prisma } from "@/lib/prisma";
import { createMember, toggleMemberActive } from "./actions";

export default async function MembersPage() {
  const members = await prisma.member.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
        Mitglieder
      </h1>

      <form action={createMember} className="mb-6 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
        />
        <input
          type="text"
          name="kegelname"
          placeholder="Kegelname (optional)"
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Hinzufügen
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
            <th className="py-2">Name</th>
            <th className="py-2">Kegelname</th>
            <th className="py-2">Status</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 text-black dark:text-zinc-50">{member.name}</td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">{member.kegelname ?? "–"}</td>
              <td className="py-2">
                {member.active ? "Aktiv" : "Inaktiv"}
              </td>
              <td className="py-2">
                <form action={toggleMemberActive}>
                  <input type="hidden" name="id" value={member.id} />
                  <input type="hidden" name="active" value={String(member.active)} />
                  <button type="submit" className="text-zinc-500 underline hover:text-black dark:hover:text-white">
                    {member.active ? "Deaktivieren" : "Aktivieren"}
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-zinc-500">
                Noch keine Mitglieder angelegt.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
