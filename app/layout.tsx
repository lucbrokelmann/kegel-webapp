import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kegelclub Verwaltung",
  description: "Verwaltungstool für den Kegelclub",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <nav className="flex gap-4 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <Link href="/" className="font-semibold text-black dark:text-zinc-50">
            Kegelclub
          </Link>
          <Link href="/members" className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
            Mitglieder
          </Link>
          <Link href="/events" className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
            Kegeltermine
          </Link>
          <Link href="/analytics" className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
            Analysen
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
