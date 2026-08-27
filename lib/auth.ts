import { createHash } from "crypto";

export const AUTH_COOKIE = "kegel_auth";

export function sessionToken(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function isValidSession(cookieValue: string | undefined) {
  if (!cookieValue) return false;
  return cookieValue === sessionToken(process.env.CLUB_PASSWORD ?? "");
}
