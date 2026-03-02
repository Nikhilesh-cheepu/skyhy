"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Offer = {
  id: string;
  title: string;
  ctaType: "VIEW_MENU" | "BOOK_TICKETS" | "VIEW_PACKAGES";
  mediaType: string;
  mediaUrl: string;
};

export default function OffersCarousel() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.error && Array.isArray(data)) {
          setOffers(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && offers.length === 0) {
    return (
      <section className="px-4 pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 h-4 w-36 rounded-full bg-white/10" />
          <div className="h-52 w-full rounded-3xl bg-white/5" />
        </div>
      </section>
    );
  }

  if (!offers.length) return null;

  return (
    <section className="px-4 pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            Offers &amp; Discounts
          </h2>
        </div>
        <div className="no-scrollbar -mx-2 overflow-x-auto pb-2">
          <div className="flex snap-x snap-mandatory gap-4 px-2">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  const href =
    offer.ctaType === "BOOK_TICKETS"
      ? "/events"
      : offer.ctaType === "VIEW_PACKAGES"
      ? "/packages-menu"
      : "/packages-menu?tab=menu";

  const isVideo = offer.mediaType.toLowerCase().includes("video");

  return (
    <div className="snap-center">
      <div className="relative mx-auto flex min-w-[68vw] max-w-[340px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/5/80 px-3 pb-3 pt-3 shadow-[0_0_40px_rgba(37,99,235,0.35)] backdrop-blur-md md:min-w-[260px]">
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-black/60"
          style={{ aspectRatio: "9 / 16" }}
        >
          {isVideo ? (
            <video
              src={offer.mediaUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <Image
              src={offer.mediaUrl}
              alt={offer.title}
              fill
              className="object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-white">
            {offer.title}
          </p>
          <Link href={href}>
            <button className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2 text-xs font-semibold text-white shadow hover:from-[#1D4ED8] hover:to-[#2563EB] active:from-[#1E40AF] active:to-[#1D4ED8]">
              {offer.ctaType === "BOOK_TICKETS"
                ? "Book Tickets"
                : offer.ctaType === "VIEW_PACKAGES"
                ? "View Party Packages"
                : "View Menu"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

