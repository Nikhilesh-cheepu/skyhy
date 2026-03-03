"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type EventItem = {
  id: string;
  title: string | null;
  eventDate: string | null;
  ticketPrice: number;
  mediaType: string;
  mediaUrl: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const peopleNumForTotal = Number.parseInt(people || "0", 10);
  const estimatedTotal =
    selectedEvent && !Number.isNaN(peopleNumForTotal) && peopleNumForTotal > 0
      ? (selectedEvent.ticketPrice ?? 0) * peopleNumForTotal
      : 0;

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!events.length || paused || showModal) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % events.length;
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
    }, 1500);
    return () => clearInterval(id);
  }, [events.length, paused, showModal]);

  useEffect(() => {
    if (!showModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal]);

  function handleCarouselInteract() {
    if (showModal) return;
    setPaused(true);
    setTimeout(() => setPaused(false), 4000);
  }

  function openModal(event: EventItem) {
    setPaused(true);
    setSelectedEvent(event);
    setSubmitError("");
    setPeople("1");
    setDate("");
    setTime("");
    setShowModal(true);
  }

  function closeModal() {
    if (submitting) return;
    setShowModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const peopleNum = parseInt(people, 10);
    if (!fullName.trim() || !mobile.trim() || !date || !time || Number.isNaN(peopleNum) || peopleNum <= 0) {
      setSubmitError("Please fill all fields correctly.");
      return;
    }
    const mobileDigitsOnly = mobile.trim();
    if (!/^\d{10}$/.test(mobileDigitsOnly)) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!selectedEvent) {
      setSubmitError("Please choose an event to book.");
      return;
    }
    setSubmitting(true);
    try {
      const currentEvent = selectedEvent;
      const ticketPrice = currentEvent.ticketPrice ?? 0;
      const amountRupees = ticketPrice * peopleNum;

      // If ticket price is zero, keep the old flow (no payment, just save + WhatsApp)
      if (!amountRupees) {
        const res = await fetch("/api/events/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            mobile: mobile.trim(),
            date,
            time,
            people: peopleNum,
            ticketPrice,
            paymentStatus: "PENDING",
            eventId: currentEvent.id,
          }),
        });
        const data = await res.json();
        if (!res.ok || data?.error) {
          throw new Error(data.error || "Failed to submit booking");
        }
        const textLines = [
          "SkyHy Event Ticket Booking:",
          `Name: ${fullName.trim()}`,
          `Mobile: ${mobile.trim()}`,
          `Date: ${date}`,
          `Time: ${time}`,
          `People: ${peopleNum}`,
          `Ticket Cost: ₹${ticketPrice || 0}`,
        ];
        const waText = encodeURIComponent(textLines.join("\n"));
        window.location.href = `https://wa.me/7013884485?text=${waText}`;
        return;
      }

      const amountPaise = amountRupees * 100;
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          amount: amountPaise,
          currency: "INR",
          booking: {
            fullName: fullName.trim(),
            mobile: mobile.trim(),
            date,
            time,
            people: peopleNum,
            ticketPrice,
            eventId: currentEvent.id ?? undefined,
          },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData?.error || !orderData?.id) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Open Razorpay checkout; webhook will set booking to PAID on payment.captured
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Payment SDK not loaded. Please try again.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: "INR",
        name: "SKYHY Live",
        description: currentEvent?.title || "Event ticket booking",
        order_id: orderData.id,
        prefill: {
          name: fullName.trim(),
          contact: mobile.trim(),
        },
        theme: {
          color: "#2563EB",
        },
        handler: () => {
          const textLines = [
            "SkyHy Event Ticket Booking:",
            `Name: ${fullName.trim()}`,
            `Mobile: ${mobile.trim()}`,
            `Date: ${date}`,
            `Time: ${time}`,
            `People: ${peopleNum}`,
            `Ticket Cost: ₹${amountRupees}`,
          ];
          const waText = encodeURIComponent(textLines.join("\n"));
          window.location.href = `https://wa.me/7013884485?text=${waText}`;
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to start payment");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-20">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Live Events
          </p>
          <h1 className="mt-1 text-2xl font-bold">Upcoming at SKYHY</h1>
        </header>

        {/* Events carousel - horizontal with peek */}
        <section className="mb-2">
          <div
            className={`no-scrollbar -mx-4 overflow-x-auto pb-4 pl-4 pr-6 ${
              showModal ? "pointer-events-none" : ""
            }`}
            onMouseDown={handleCarouselInteract}
            onTouchStart={handleCarouselInteract}
          >
            <div className="flex snap-x snap-mandatory gap-4">
              {loading && !events.length && (
                <div className="h-72 min-w-[70vw] max-w-[360px] rounded-3xl border border-white/15 bg-white/5" />
              )}
              {!loading && events.length === 0 && (
                <p className="px-2 text-sm text-white/60">No events announced yet.</p>
              )}
              {events.map((event, idx) => {
                const isVideo = event.mediaType.toLowerCase().includes("video");
                const isActive = idx === activeIndex;
                return (
                  <article
                    key={event.id}
                    ref={(el: HTMLDivElement | null) => {
                      cardsRef.current[idx] = el;
                    }}
                    className="snap-center"
                    style={{ scrollSnapAlign: "center" }}
                  >
                    <div
                      className={`relative mx-auto flex min-w-[70vw] max-w-[360px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 via-black/70 to-black/95 px-3 pb-4 pt-3 shadow-[0_0_40px_rgba(15,23,42,0.9)] backdrop-blur-md transition-transform ${
                        isActive ? "scale-100" : "scale-[0.95] opacity-80"
                      }`}
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-2xl bg-black/70"
                        style={{ aspectRatio: "9 / 16" }}
                      >
                        {isVideo ? (
                          <video
                            src={event.mediaUrl}
                            className="h-full w-full object-contain"
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.mediaUrl}
                            alt={event.title ?? "SkyHy event"}
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        <h2 className="line-clamp-2 font-semibold">
                          {event.title || "SkyHy Live Event"}
                        </h2>
                        <div className="flex items-center justify-between gap-3 text-xs text-white/70">
                          {event.eventDate ? (
                            <span>
                              {new Date(event.eventDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          ) : (
                            <span>Upcoming date</span>
                          )}
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[#93C5FD]">
                            Ticket ₹{event.ticketPrice ?? 0} / person
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openModal(event)}
                          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow hover:from-[#1D4ED8] hover:to-[#2563EB] active:from-[#1E40AF] active:to-[#1D4ED8] transition-colors"
                        >
                          Book Tickets
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Booking modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-4 pt-16 md:items-center md:px-0">
          <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-[#020617] shadow-2xl md:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Book Tickets
                </p>
                <p className="text-sm font-semibold line-clamp-1">
                  {selectedEvent.title || "SkyHy Live Event"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4 pt-3">
              {submitError && (
                <p className="text-xs text-red-400">{submitError}</p>
              )}
              <div className="space-y-1">
                <label className="block text-xs text-white/70">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-white/70">Mobile Number</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="block text-xs text-white/70">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="block text-xs text-white/70">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-white/70">Number of People</label>
                <div className="flex items-center justify-between rounded-lg border border-white/15 bg-black/40 px-3 py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPeople((prev) => {
                        const current = Number.parseInt(prev || "1", 10);
                        const next = Math.max(1, current - 1);
                        return String(next);
                      })
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm text-white hover:bg-white/20"
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold text-white">
                    {people || "1"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPeople((prev) => {
                        const current = Number.parseInt(prev || "1", 10);
                        const next = Math.min(50, current + 1);
                        return String(next);
                      })
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm text-white hover:bg-white/20"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 text-sm">
                <span className="text-white/70">Estimated total</span>
                <span className="text-base font-semibold text-[#93C5FD]">
                  ₹{estimatedTotal}
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-60"
              >
                {submitting
                  ? "Processing…"
                  : estimatedTotal > 0
                  ? "Proceed to Pay"
                  : "Confirm on WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  );
}

