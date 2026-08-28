import Link from "next/link";
import { createMember, toggleMemberActive, updateMember } from "./actions";
import { getClubOverview } from "@/lib/stats";

const FILTERS = [
  { value: "all", label: "Alle" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Inaktiv" },
] as const;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter: rawFilter, q } = await searchParams;
  const filter = FILTERS.some((f) => f.value === rawFilter) ? rawFilter! : "all";

  const { memberStats } = await getClubOverview();

  const query = q?.trim().toLowerCase() ?? "";
  const rows = memberStats.filter((s) => {
    if (filter === "active" && !s.member.active) return false;
    if (filter === "inactive" && s.member.active) return false;
    if (query) {
      const haystack = `${s.member.name} ${s.member.kegelname ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const activeCount = memberStats.filter((s) => s.member.active).length;

  return (
    <>
      <div className="flex h-[72px] flex-shrink-0 items-center justify-between border-b border-border px-10">
        <div>
          <div className="font-display text-xl font-extrabold text-foreground">Mitglieder</div>
          <div className="mt-0.5 text-sm text-muted">
            {memberStats.length} Mitglieder, {activeCount} aktiv
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-10">
        <form action={createMember} className="flex gap-2 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            className="flex-1 rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            name="kegelname"
            placeholder="Kegelname (optional)"
            className="flex-1 rounded-lg border border-border-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
            Hinzufügen
          </button>
        </form>

        <div className="flex items-center justify-between">
          <div className="inline-flex gap-0.5 rounded-lg border border-border bg-surface-sunken p-0.5">
            {FILTERS.map((f) => (
              <Link
                key={f.value}
                href={f.value === "all" ? "/members" : `/members?filter=${f.value}`}
                className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold ${
                  filter === f.value ? "bg-surface text-foreground shadow-sm" : "text-muted"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          <form method="get" className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-muted">
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Mitglied suchen…"
              className="w-52 border-none bg-transparent text-[13px] text-foreground outline-none"
            />
          </form>
        </div>

        <div className="rounded-xl border border-border bg-surface shadow-[0_1px_2px_oklch(0_0_0/0.04)]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Name</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Kegelname</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Anwesenheitsquote</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted">Status</th>
                <th className="border-b border-border px-5 pb-2.5 pt-3.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ member, quote }) => {
                const formId = `member-form-${member.id}`;
                return (
                  <tr key={member.id}>
                    <td className="border-b border-border px-5 py-3 last:border-none">
                      <form id={formId} action={updateMember}>
                        <input type="hidden" name="id" value={member.id} />
                      </form>
                      <input
                        type="text"
                        name="name"
                        form={formId}
                        defaultValue={member.name}
                        required
                        className="w-full rounded-lg border border-transparent px-2 py-1 text-sm font-semibold text-foreground outline-none hover:border-border-strong focus:border-accent"
                      />
                    </td>
                    <td className="border-b border-border px-5 py-3 last:border-none">
                      <input
                        type="text"
                        name="kegelname"
                        form={formId}
                        defaultValue={member.kegelname ?? ""}
                        placeholder="–"
                        className="w-full rounded-lg border border-transparent px-2 py-1 text-sm text-muted outline-none hover:border-border-strong focus:border-accent"
                      />
                    </td>
                    <td className="border-b border-border px-5 py-3 last:border-none">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-surface-sunken">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${quote}%` }} />
                        </div>
                        <span className="text-sm text-foreground">{quote}%</span>
                      </div>
                    </td>
                    <td className="border-b border-border px-5 py-3 last:border-none">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          member.active ? "bg-success-soft text-success" : "bg-surface-sunken text-muted"
                        }`}
                      >
                        {member.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="border-b border-border px-5 py-3 last:border-none">
                      <div className="flex items-center justify-end gap-3">
                        <button type="submit" form={formId} className="text-[13px] font-semibold text-accent hover:underline">
                          Speichern
                        </button>
                        <form action={toggleMemberActive}>
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="active" value={String(member.active)} />
                          <button type="submit" className="text-[13px] font-semibold text-muted hover:text-foreground hover:underline">
                            {member.active ? "Deaktivieren" : "Aktivieren"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted">
                    Keine Mitglieder gefunden.
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
