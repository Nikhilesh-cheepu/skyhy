'use client';

import Link from 'next/link';

const WHATSAPP_NUMBER = '7013884485';
const WHATSAPP_MESSAGE = 'Hi SKYHY Live! I would like to know more about your offerings.';

export default function StickyActions() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pt-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      {/* Outer pill container — compact, dark glass, SkyHy blue border glow */}
      <div
        className="flex w-full max-w-[360px] items-center gap-1.5 rounded-full px-2 py-2 backdrop-blur-xl"
        style={{
          background: 'rgba(0,0,0,0.65)',
          border: '1px solid rgba(37,99,235,0.35)',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 12px rgba(37,99,235,0.15)',
        }}
      >
        {/* WhatsApp — flex-[1], green theme + subtle green glow */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-[1] min-w-0 items-center justify-center gap-1.5 rounded-full py-2 px-2.5 transition-all duration-200 active:scale-[0.98]"
          style={{
            border: '1px solid rgba(37,211,102,0.25)',
            boxShadow: 'inset 0 0 8px rgba(37,211,102,0.08)',
          }}
          aria-label="Chat on WhatsApp"
        >
          <svg className="h-4 w-4 shrink-0 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
          <span className="whitespace-nowrap text-[11px] font-medium text-white/95">WhatsApp</span>
        </a>

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-white/10" aria-hidden />

        {/* Call — flex-[1], blue theme (SkyHy blue) */}
        <a
          href={`tel:${WHATSAPP_NUMBER}`}
          className="flex flex-[1] min-w-0 items-center justify-center gap-1.5 rounded-full py-2 px-2.5 transition-all duration-200 active:scale-[0.98]"
          style={{
            border: '1px solid rgba(37,99,235,0.3)',
            boxShadow: 'inset 0 0 8px rgba(37,99,235,0.1)',
          }}
          aria-label="Call"
        >
          <svg className="h-4 w-4 shrink-0 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="whitespace-nowrap text-[11px] font-medium text-white/95">Call</span>
        </a>

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-white/10" aria-hidden />

        {/* Book Table — flex-[1.8], dominant CTA, SkyHy neon accent */}
        <div className="relative flex-[1.8] min-w-0">
          {/* 25% OFF chip — above the pill, no overlap */}
          <span
            className="absolute -top-2 right-1 z-10 rounded-full bg-[#B6FF00] px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-[#1E40AF]"
            aria-hidden
          >
            25% OFF
          </span>
          <Link
            href="/reserve"
            className="flex items-center justify-center gap-1.5 rounded-full py-2 px-3 transition-all duration-200 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg, rgba(37,99,235,0.35) 0%, rgba(30,64,175,0.25) 100%)',
              border: '1px solid rgba(37,99,235,0.5)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 16px rgba(182,255,0,0.2)',
            }}
            aria-label="Book a table"
          >
            <svg className="h-4 w-4 shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="whitespace-nowrap text-[11px] font-semibold text-white">Book Table</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
