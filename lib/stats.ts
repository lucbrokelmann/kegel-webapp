import { prisma } from "@/lib/prisma";

export async function getClubOverview() {
  const [members, events] = await Promise.all([
    prisma.member.findMany({ orderBy: { name: "asc" }, include: { attendances: true } }),
    prisma.event.findMany({ orderBy: { date: "asc" }, include: { attendances: true } }),
  ]);

  const totalEvents = events.length;

  const now = new Date();
  const completedEventIds = new Set(events.filter((e) => e.date < now).map((e) => e.id));
  const completedEventCount = completedEventIds.size;

  const memberStats = members.map((member) => {
    const presentCount = member.attendances.filter((a) => a.present && completedEventIds.has(a.eventId)).length;
    const quote = completedEventCount > 0 ? Math.round((presentCount / completedEventCount) * 100) : 0;
    const strafeSum = member.attendances.reduce((sum, a) => sum + Number(a.strafe), 0);
    return { member, presentCount, quote, strafeSum };
  });

  const activeStats = memberStats.filter((s) => s.member.active);
  const avgQuote = activeStats.length
    ? Math.round(activeStats.reduce((sum, s) => sum + s.quote, 0) / activeStats.length)
    : 0;
  const totalStrafe = memberStats.reduce((sum, s) => sum + s.strafeSum, 0);

  const upcomingEvents = events.filter((e) => e.date >= now).slice(0, 3);
  const leaderboard = [...activeStats].sort((a, b) => b.quote - a.quote).slice(0, 5);
  const topMember = leaderboard[0];

  return {
    members,
    events,
    memberStats,
    activeStats,
    totalEvents,
    completedEventCount,
    avgQuote,
    totalStrafe,
    upcomingEvents,
    leaderboard,
    topMember,
  };
}

export function formatEuro(amount: number) {
  return amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dayMonth(date: Date) {
  return {
    day: date.toLocaleDateString("de-DE", { day: "2-digit" }),
    month: date.toLocaleDateString("de-DE", { month: "short" }).replace(".", ""),
  };
}
