"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createMember(formData: FormData) {
  const name = formData.get("name");
  const kegelname = formData.get("kegelname");
  if (typeof name !== "string" || !name.trim()) return;

  await prisma.member.create({
    data: {
      name: name.trim(),
      kegelname: typeof kegelname === "string" && kegelname.trim() ? kegelname.trim() : null,
    },
  });
  revalidatePath("/members");
}

export async function toggleMemberActive(formData: FormData) {
  const id = Number(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.member.update({ where: { id }, data: { active: !active } });
  revalidatePath("/members");
}
