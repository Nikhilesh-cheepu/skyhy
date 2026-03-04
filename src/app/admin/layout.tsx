"use client";

import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-[#E7ECF2]">
      <main className="mx-auto max-w-6xl px-3 pb-10 pt-4 md:px-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-3 shadow-[0_0_40px_rgba(15,23,42,0.8)] backdrop-blur-xl md:p-5">
          {children}
        </div>
      </main>
    </div>
  );
}

