"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

export async function saveAttendance(formData: FormData) {
  const eventId = Number(formData.get("eventId"));
  const memberIds = formData.getAll("memberId").map(Number);

  await Promise.all(
    memberIds.map((memberId) => {
      const present = formData.get(`present-${memberId}`) === "on";
      const strafeRaw = formData.get(`strafe-${memberId}`);
      const strafe = typeof strafeRaw === "string" && strafeRaw ? Number(strafeRaw) : 0;

      return prisma.attendance.upsert({
        where: { eventId_memberId: { eventId, memberId } },
        create: { eventId, memberId, present, strafe },
        update: { present, strafe },
      });
    })
  );

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/analytics");
}
