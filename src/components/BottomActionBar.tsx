'use client';

import { useState } from 'react';
import Link from 'next/link';

const WHATSAPP_NUMBER = '7013884485';
const WHATSAPP_MESSAGE =
  'Hi SKYHY Live! I would like to know more about your offerings.';

export default function BottomActionBar() {
  const [openReachUs, setOpenReachUs] = useState(false);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`;
  const callHref = `tel:${WHATSAPP_NUMBER}`;

  async function trackClick(type: 'whatsapp' | 'call') {
    try {
      await fetch('/api/analytics/contact-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
        keepalive: true,
      });
    } catch {
      // ignore
    }
  }

  return (
    <>
      {openReachUs && (
        <button
          type="button"
          aria-label="Close reach us menu"
          onClick={() => setOpenReachUs(false)}
          className="fixed inset-0 z-40 bg-black/20"
        />
      )}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-2 pt-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div
          className="w-full max-w-[480px] rounded-3xl border border-white/10 bg-black/80 px-2.5 py-2.5 shadow-[0_-6px_24px_rgba(0,0,0,0.7)] backdrop-blur-xl"
        >
          <div className="grid grid-cols-3 gap-2.5">
            {/* Reach Us */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenReachUs((prev) => !prev)}
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-lime-400 px-2 text-[11px] font-semibold text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.35)] transition-all duration-150 active:scale-95 active:brightness-110"
              >
                <span>📞</span>
                <span>Reach Us</span>
              </button>
            </div>

            {/* Book Table (primary) */}
            <div className="relative">
              <span
                className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#B6FF00] px-2 py-0.5 text-[9px] font-semibold leading-tight text-[#1E40AF] shadow-md"
                aria-hidden
              >
                25% OFF
              </span>
              <Link
                href="/reserve"
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-2 text-[11px] font-semibold text-slate-950 shadow-[0_8px_22px_rgba(245,158,11,0.45)] transition-all duration-150 active:scale-95 active:brightness-110"
                aria-label="Book a table"
              >
                <span>📅</span>
                <span>Book Table</span>
              </Link>
            </div>

            {/* Pay Bill */}
            <div className="relative">
              <Link
                href="/bills"
                className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 px-2 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(56,189,248,0.45)] transition-all duration-150 active:scale-95 active:brightness-110"
                aria-label="Pay your bill"
              >
                <span>💳</span>
                <span>Pay Bill</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reach Us sheet */}
      {openReachUs && (
        <div className="fixed bottom-20 left-1/2 z-50 w-[92vw] max-w-[360px] -translate-x-1/2 rounded-3xl border border-white/12 bg-slate-950/95 px-4 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
            Contact SKYHY
          </p>
          <div className="flex flex-col gap-1.5 text-[12px]">
            <button
              type="button"
              onClick={async () => {
                await trackClick('whatsapp');
                window.open(whatsappHref, '_blank');
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-white/8 px-3 py-2.5 text-white transition-colors hover:bg-white/14"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-lg">
                  💬
                </span>
                <span>WhatsApp</span>
              </span>
              <span className="text-[11px] text-emerald-300">Chat</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await trackClick('call');
                window.location.href = callHref;
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-white/8 px-3 py-2.5 text-white transition-colors hover:bg-white/14"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/15 text-lg">
                  📞
                </span>
                <span>Call</span>
              </span>
              <span className="text-[11px] text-white/60">
                +91 {WHATSAPP_NUMBER}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

