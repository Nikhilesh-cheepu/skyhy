"use client";

import { useEffect, useState } from "react";

type MenuImage = {
  id: string;
  url: string;
  title: string | null;
};

export default function MenuGalleryCarousel() {
  const [images, setImages] = useState<MenuImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu-gallery")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.error && Array.isArray(data)) {
          setImages(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && !images.length) {
    return (
      <div className="mb-6 mt-2 h-40 w-full rounded-3xl border border-white/10 bg-white/5" />
    );
  }

  if (!images.length) return null;

  return (
    <div className="mb-6 mt-2">
      <div className="-mx-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex snap-x snap-mandatory gap-3 px-2">
          {images.map((img) => (
            <div key={img.id} className="snap-center">
              <div className="relative mx-auto h-52 min-w-[46vw] max-w-[220px] overflow-hidden rounded-2xl border border-white/20 bg-black/50 shadow-lg md:min-w-[180px]">
                {/* 4:5 ratio via fixed height/width on small cards */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title ?? "Menu image"}
                  className="h-full w-full object-cover transition-transform duration-200 active:scale-95"
                />
              </div>
              {img.title && (
                <p className="mt-1 line-clamp-1 text-center text-[11px] text-white/70">
                  {img.title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

