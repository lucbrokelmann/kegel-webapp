"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, sessionToken } from "@/lib/auth";

export async function login(_prevState: string | null, formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || password !== process.env.CLUB_PASSWORD) {
    return "Falsches Passwort";
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}
