'use client';

import Link from 'next/link';

const WHATSAPP_NUMBER = '7013884485';
const WHATSAPP_MESSAGE = 'Hi SKYHY Live! I would like to know more about your offerings.';

export default function BottomActionBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pt-4 md:pt-0"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex w-full max-w-lg items-center justify-between gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl shadow-lg md:max-w-md md:py-2.5 md:hover:bg-black/70">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1 rounded-full py-2 transition-colors active:scale-95 md:flex-row md:gap-2 md:px-4 md:py-2 md:hover:bg-white/5"
          aria-label="Chat on WhatsApp"
        >
          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
          <span className="text-xs font-medium text-white md:text-sm">WhatsApp</span>
        </a>

        {/* Call */}
        <a
          href={`tel:${WHATSAPP_NUMBER}`}
          className="flex flex-1 flex-col items-center gap-1 rounded-full py-2 transition-colors active:scale-95 md:flex-row md:gap-2 md:px-4 md:py-2 md:hover:bg-white/5"
          aria-label="Call"
        >
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-xs font-medium text-white md:text-sm">Call</span>
        </a>

        {/* Book (with 25% OFF badge) */}
        <Link
          href="/reserve"
          className="relative flex flex-1 flex-col items-center gap-1 rounded-full py-2 transition-colors active:scale-95 md:flex-row md:gap-2 md:px-4 md:py-2 md:hover:bg-white/5"
          aria-label="Book a table"
        >
          <span className="absolute -top-1.5 right-4 rounded-full bg-[#B6FF00] px-1.5 py-0.5 text-[10px] font-bold text-[#1E40AF] md:right-6">
            25% OFF
          </span>
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium text-white md:text-sm">Book</span>
        </Link>
      </div>
    </div>
  );
}
