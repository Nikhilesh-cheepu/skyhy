"use client";

import { useEffect, useRef, useState } from "react";

type MenuImage = {
  id: string;
  url: string;
  title: string | null;
};

export default function MenuGalleryCarousel() {
  const [images, setImages] = useState<MenuImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    if (!images.length || paused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % images.length;
        const el = cardsRef.current[next];
        if (el) {
          el.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
          });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [images.length, paused]);

  const handleUserInteract = () => {
    if (!images.length) return;
    setPaused(true);
    window.setTimeout(() => setPaused(false), 6000);
  };

  if (loading && !images.length) {
    return (
      <div className="mb-6 mt-2 h-40 w-full rounded-3xl border border-white/10 bg-white/5" />
    );
  }

  if (!images.length) return null;

  return (
    <div className="mb-8 mt-6">
      <div
        ref={stripRef}
        className="-mx-4 overflow-x-auto no-scrollbar pb-1"
        onMouseDown={handleUserInteract}
        onTouchStart={handleUserInteract}
      >
        <div className="flex snap-x snap-mandatory gap-4 px-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="snap-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <div className="relative mx-auto w-[86vw] max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-black/70 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
                <div className="aspect-video w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.title ?? "Menu image"}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                {img.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-6">
                    <p className="line-clamp-1 text-[12px] font-medium text-white/90">
                      {img.title}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

