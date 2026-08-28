"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

export async function createEvent(formData: FormData) {
  const date = formData.get("date");
  const notes = formData.get("notes");
  if (typeof date !== "string" || !date) return;

  const event = await prisma.event.create({
    data: {
      date: new Date(date),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    },
  });
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEvent(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const date = formData.get("date");
  const notes = formData.get("notes");
  if (typeof date !== "string" || !date) return;

  await prisma.event.update({
    where: { id: eventId },
    data: {
      date: new Date(date),
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/analytics");
}

async function applyAbsentAverage(eventId: number) {
  const [members, attendances] = await Promise.all([
    prisma.member.findMany({ where: { active: true }, select: { id: true } }),
    prisma.attendance.findMany({ where: { eventId } }),
  ]);

  const byMember = new Map(attendances.map((a) => [a.memberId, a]));
  const presentStrafes = attendances.filter((a) => a.present).map((a) => Number(a.strafe));
  const avgStrafe =
    presentStrafes.length > 0
      ? roundToQuarter(presentStrafes.reduce((sum, s) => sum + s, 0) / presentStrafes.length)
      : 0;

  await Promise.all(
    members
      .filter((m) => !byMember.get(m.id)?.present)
      .map((m) =>
        prisma.attendance.upsert({
          where: { eventId_memberId: { eventId, memberId: m.id } },
          create: { eventId, memberId: m.id, present: false, strafe: avgStrafe, paid: false },
          update: { strafe: avgStrafe },
        })
      )
  );
}

export async function toggleAttendancePresent(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const memberId = Number(formData.get("memberId"));
  const present = formData.get("present") === "true";

  await prisma.attendance.upsert({
    where: { eventId_memberId: { eventId, memberId } },
    create: { eventId, memberId, present: !present, strafe: 0, paid: false },
    update: { present: !present },
  });

  await applyAbsentAverage(eventId);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/analytics");
  revalidatePath("/payments");
}

export async function saveAttendance(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const memberIds = formData.getAll("memberId").map(Number);

  const existing = await prisma.attendance.findMany({ where: { eventId } });
  const byMember = new Map(existing.map((a) => [a.memberId, a]));

  // Presence is toggled instantly via toggleAttendancePresent - this form only
  // updates strafe (for present members) and paid, never present itself.
  await Promise.all(
    memberIds.map((memberId) => {
      const isPresent = byMember.get(memberId)?.present ?? false;
      const paid = formData.get(`paid-${memberId}`) === "on";

      if (!isPresent) {
        return prisma.attendance.upsert({
          where: { eventId_memberId: { eventId, memberId } },
          create: { eventId, memberId, present: false, strafe: 0, paid },
          update: { paid },
        });
      }

      const strafeRaw = formData.get(`strafe-${memberId}`);
      const strafe = typeof strafeRaw === "string" && strafeRaw ? roundToQuarter(Number(strafeRaw)) : 0;

      return prisma.attendance.upsert({
        where: { eventId_memberId: { eventId, memberId } },
        create: { eventId, memberId, present: true, strafe, paid },
        update: { strafe, paid },
      });
    })
  );

  await applyAbsentAverage(eventId);

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/analytics");
  revalidatePath("/payments");
}

export async function toggleAttendancePaid(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const memberId = Number(formData.get("memberId"));
  const paid = formData.get("paid") === "true";

  await prisma.attendance.update({
    where: { eventId_memberId: { eventId, memberId } },
    data: { paid: !paid },
  });

  revalidatePath("/payments");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/analytics");
}
