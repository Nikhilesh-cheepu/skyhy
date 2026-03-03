"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/menu-images", label: "Menu Images" },
  { href: "/admin/bills", label: "Bills" },
  { href: "/admin/logout", label: "Logout" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-[#E7ECF2]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold tracking-[0.25em] text-white/80 shadow-sm"
          >
            ADMIN
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 shadow-sm hover:bg-white/10 md:h-10 md:w-10"
            aria-label="Open admin navigation"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm md:justify-center">
          <div className="h-full w-72 max-w-full bg-[#020617] shadow-2xl md:mt-16 md:h-auto md:max-h-[420px] md:w-80 md:rounded-3xl md:border md:border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold text-white/80">Admin menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10"
                aria-label="Close admin navigation"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1 px-3 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-white/40">›</span>
                </Link>
              ))}
            </nav>
          </div>
          <button
            type="button"
            aria-hidden
            className="absolute inset-0 -z-10"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <main className="mx-auto max-w-6xl px-3 pb-10 pt-4 md:px-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-3 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur-xl md:p-5">
          {children}
        </div>
      </main>
    </div>
  );
}

