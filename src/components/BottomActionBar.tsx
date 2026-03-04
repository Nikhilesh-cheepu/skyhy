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
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pt-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
      >
        <div
          className="flex w-full max-w-[380px] items-center gap-2 rounded-full px-2.5 py-2.5 backdrop-blur-xl"
          style={{
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(37,99,235,0.35)',
            boxShadow:
              '0 -2px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 12px rgba(37,99,235,0.15)',
          }}
        >
          {/* Reach Us */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setOpenReachUs((prev) => !prev)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3 py-2.5 text-[12px] font-semibold text-white/90 transition-all duration-200 active:scale-[0.98]"
            >
              <span>📞</span>
              <span>Reach Us</span>
            </button>
            {openReachUs && (
              <div className="absolute bottom-12 left-1/2 z-50 w-[230px] -translate-x-1/2">
                {/* Arrow */}
                <div className="mx-auto h-3 w-3 rotate-45 border-l border-t border-white/15 bg-black/90" />
                {/* Card */}
                <div className="mt-1 rounded-2xl border border-white/15 bg-black/90 px-3.5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">
                    Contact SKYHY
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-[12px] font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]/15 text-lg">
                          💬
                        </span>
                        <span>WhatsApp</span>
                      </span>
                      <span className="text-[11px] text-white/60">Chat</span>
                    </a>
                    <a
                      href={callHref}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-[12px] font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#38BDF8]/15 text-lg">
                          📞
                        </span>
                        <span>Call</span>
                      </span>
                      <span className="text-[11px] text-white/60">
                        +91 {WHATSAPP_NUMBER}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Book Table (primary) */}
          <div className="relative flex-[1.2] min-w-0 pt-1">
            <span
              className="pointer-events-none absolute -top-2 right-3 z-10 rounded-full bg-[#B6FF00] px-2 py-0.5 text-[10px] font-semibold leading-tight text-[#1E40AF]"
              aria-hidden
            >
              25% OFF
            </span>
            <Link
              href="/reserve"
              className="flex items-center justify-center gap-1.5 rounded-full border border-amber-300/60 bg-gradient-to-r from-[#FACC15] to-[#F97316] px-3 py-2.5 text-[12px] font-semibold text-black shadow-sm transition-all duration-200 active:scale-[0.98]"
              aria-label="Book a table"
            >
              <span>📅</span>
              <span>Book Table</span>
            </Link>
          </div>

          {/* Pay Bill */}
          <div className="flex-1 min-w-0">
            <Link
              href="/bills"
              className="flex items-center justify-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-2.5 text-[12px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98]"
              aria-label="Pay your bill"
            >
              <span>💳</span>
              <span>Pay Bill</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

