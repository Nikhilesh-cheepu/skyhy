 "use client";

import Image from "next/image";
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
  const [, setIsVisible] = useState(false);
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

  // Only run auto-scroll when the gallery strip is actually visible in viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    const strip = stripRef.current;
    if (!strip) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { threshold: 0.3 },
    );

    observer.observe(strip);
    return () => {
      observer.disconnect();
    };
  }, [images.length]);

  if (loading && !images.length) {
    return (
      <div className="mb-8 mt-4 h-40 w-full rounded-3xl border border-white/10 bg-white/5" />
    );
  }

  if (!images.length) return null;

  const showArrows = images.length > 1;

  const scrollToIndex = (index: number) => {
    const clamped = ((index % images.length) + images.length) % images.length;
    const el = cardsRef.current[clamped];
    const strip = stripRef.current;
    if (!el || !strip) return;
    const cardRect = el.getBoundingClientRect();
    const stripRect = strip.getBoundingClientRect();
    const targetCenter =
      cardRect.left -
      stripRect.left -
      (stripRect.width - cardRect.width) / 2;
    strip.scrollTo({
      left: strip.scrollLeft + targetCenter,
      behavior: "smooth",
    });
    setActiveIndex(clamped);
  };

  const handlePrev = () => scrollToIndex(activeIndex - 1);
  const handleNext = () => scrollToIndex(activeIndex + 1);

  return (
    <section className="mb-10 mt-6">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              Gallery
            </p>
            <p className="text-xs text-white/60">
              A quick peek into the SKYHY vibe.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Desktop chevrons */}
          {showArrows && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="group absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white/80 shadow-lg backdrop-blur md:flex hover:bg-white/10"
                aria-label="Previous image"
              >
                <span className="text-lg group-active:translate-x-[-1px]">
                  ‹
                </span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="group absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white/80 shadow-lg backdrop-blur md:flex hover:bg-white/10"
                aria-label="Next image"
              >
                <span className="text-lg group-active:translate-x-[1px]">
                  ›
                </span>
              </button>
            </>
          )}

          <div
            ref={stripRef}
            className="no-scrollbar -mx-4 overflow-x-auto scroll-smooth pb-1"
          >
            <div className="flex snap-x snap-mandatory gap-4 px-[10vw]">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className="snap-center"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <div
                    className={`relative mx-auto w-[85vw] max-w-[780px] overflow-hidden rounded-3xl border bg-black/60 shadow-[0_18px_40px_rgba(0,0,0,0.85)] backdrop-blur-lg transition-transform duration-300 ${
                      index === activeIndex
                        ? "border-white/35 scale-[1.0]"
                        : "border-white/12 scale-[0.96]"
                    }`}
                  >
                    <div className="relative aspect-video w-full">
                      <Image
                        src={img.url}
                        alt={img.title ?? "Gallery image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 85vw, 60vw"
                      />
                    </div>
                    {img.title && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-6">
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

          {/* Pagination dots */}
          {images.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/30"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

