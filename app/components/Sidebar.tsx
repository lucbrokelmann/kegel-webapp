"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Übersicht",
    match: (path: string) => path === "/",
    icon: (
      <path d="M3 11l9-7 9 7M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    href: "/members",
    label: "Mitglieder",
    match: (path: string) => path.startsWith("/members"),
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
        <circle cx="17" cy="8.5" r="2.6" />
        <path d="M16 14.2c2.7.4 4.5 2.4 4.5 5.3" />
      </>
    ),
  },
  {
    href: "/events",
    label: "Kegeltermine",
    match: (path: string) => path.startsWith("/events"),
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
        <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
      </>
    ),
  },
  {
    href: "/analytics",
    label: "Analysen",
    match: (path: string) => path.startsWith("/analytics"),
    icon: <path d="M4 20V10M11 20V4M18 20v-7" />,
  },
  {
    href: "/payments",
    label: "Zahlungen",
    match: (path: string) => path.startsWith("/payments"),
    icon: (
      <>
        <rect x="2.5" y="6" width="19" height="13" rx="2" />
        <path d="M2.5 10h19" />
        <path d="M6 14.5h4" />
      </>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <div className="flex w-[248px] flex-shrink-0 flex-col border-r border-border bg-surface-sunken">
      <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3c1 2 1 3 0 5-1 2-1 3 0 5s1 3 0 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="19" r="1.6" fill="#fff" />
          </svg>
        </div>
        <div className="font-display text-sm font-extrabold text-foreground">Kegelclub</div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold ${
                active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="border-t border-border px-5 py-4">
        <button type="submit" className="text-sm font-semibold text-muted hover:text-foreground">
          Abmelden
        </button>
      </form>
    </div>
  );
}
