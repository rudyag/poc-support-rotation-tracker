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
  title: "Support Rotation Tracker",
  description: "Manage support roster and rotations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-4 text-sm font-medium text-slate-700">
            <Link className="hover:text-slate-900" href="/">
              Dashboard
            </Link>
            <Link className="hover:text-slate-900" href="/roster">
              Roster
            </Link>
            <Link className="hover:text-slate-900" href="/schedule">
              Schedule
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
