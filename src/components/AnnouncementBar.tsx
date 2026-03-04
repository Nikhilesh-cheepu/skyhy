"use client";

import Link from "next/link";

const ITEMS = [
  {
    id: "128",
    text: "Eat & Drink Anything @ ₹128 (12:00–7:45)",
    href: "/packages-menu?tab=menu",
    icon: "✨",
  },
  {
    id: "ala-carte",
    text: "25% OFF on À la carte — Limited slots daily",
    href: "/packages-menu",
    icon: "🔥",
  },
  {
    id: "live-music",
    text: "Live Music • Every Single Day",
    href: "/events",
    icon: "🎵",
  },
  {
    id: "corporate",
    text: "Corporate Parties • Big Group Deals",
    href: "/reserve",
    icon: "💼",
  },
  {
    id: "celebrations",
    text: "Birthdays & Celebrations • Book Now",
    href: "/reserve",
    icon: "🎂",
  },
];

export default function AnnouncementBar() {
  return (
    <div
      className="group relative w-full overflow-hidden border-b border-sky-500/25 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-1.5 shadow-[0_0_18px_rgba(56,189,248,0.25)]"
      role="region"
      aria-label="Promotions"
    >
      <div className="announcement-marquee flex w-max items-center gap-6 whitespace-nowrap px-4 text-[11px] font-medium text-white/90 group-hover:[animation-play-state:paused]">
        {ITEMS.concat(ITEMS).map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href={item.href}
            className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden className="text-sm">
              {item.icon}
            </span>
            <span>{item.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
