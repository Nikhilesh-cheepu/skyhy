"use client";

import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/7013884485";

const ContentBlock = () => (
  <>
    <span aria-hidden>⚡</span>
    <span>
      We&apos;re currently upgrading our website experience. Some information,
      pricing, or availability may be temporarily inaccurate.
    </span>
    <span aria-hidden>📞</span>
    <span>
      For immediate assistance, please{" "}
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-[#B6FF00]/80 underline-offset-2 hover:text-[#B6FF00] hover:decoration-[#B6FF00]"
      >
        contact us directly
      </Link>
      .
    </span>
  </>
);

export default function AnnouncementBar() {
  return (
    <div
      className="group relative w-full overflow-hidden border-b border-[#3B82F6]/30 bg-gradient-to-r from-[#0F172A] via-[#1E3A5F] to-[#0F172A] py-2 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
      role="region"
      aria-label="Announcement"
    >
      <div className="announcement-marquee flex w-max items-center gap-8 whitespace-nowrap px-4 text-sm font-medium text-white/95">
        <ContentBlock />
        <ContentBlock />
      </div>
    </div>
  );
}
