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
  const [activeIndex, setActiveIndex] = useState(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    if (!events.length) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % events.length;
        const el = cardsRef.current[next];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
        return next;
      });
    }, 6000);
    return () => clearInterval(id);
  }, [events.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const peopleNum = parseInt(people, 10);
    if (!fullName.trim() || !mobile.trim() || !date || !time || Number.isNaN(peopleNum) || peopleNum <= 0) {
      setSubmitError("Please fill all fields correctly.");
      return;
    }
    setSubmitting(true);
    try {
      const currentEvent = events[activeIndex] ?? null;
      const ticketPrice = currentEvent?.ticketPrice ?? 0;
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
            eventId: currentEvent?.id,
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
        body: JSON.stringify({ amount: amountPaise, currency: "INR" }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData?.error || !orderData?.id) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      // Open Razorpay checkout
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
        handler: async () => {
          try {
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
                paymentStatus: "PAID",
                eventId: currentEvent?.id,
              }),
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
              throw new Error(data.error || "Failed to save booking");
            }
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
          } catch (err) {
            setSubmitError(
              err instanceof Error ? err.message : "Payment succeeded but saving booking failed.",
            );
          } finally {
            setSubmitting(false);
          }
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

        {/* Events carousel */}
        <section className="mb-8">
          <div className="no-scrollbar -mx-2 overflow-x-auto pb-3">
            <div className="flex snap-x snap-mandatory gap-4 px-2">
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
                  <div
                    key={event.id}
                    ref={(el) => {
                      cardsRef.current[idx] = el;
                    }}
                    className="snap-center"
                  >
                    <div
                      className={`relative mx-auto flex min-w-[68vw] max-w-[340px] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/5 px-3 pb-3 pt-3 shadow-[0_0_40px_rgba(37,99,235,0.35)] backdrop-blur-md transition-transform ${
                        isActive ? "scale-100" : "scale-[0.95] opacity-80"
                      }`}
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-2xl bg-black/60"
                        style={{ aspectRatio: "9 / 16" }}
                      >
                        {isVideo ? (
                          <video
                            src={event.mediaUrl}
                            className="h-full w-full object-cover"
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
                            className="h-full w-full object-cover"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                      <div className="mt-3 space-y-1 text-sm">
                        <p className="line-clamp-2 font-semibold">
                          {event.title || "SkyHy Live Event"}
                        </p>
                        {event.eventDate && (
                          <p className="text-xs text-white/60">
                            {new Date(event.eventDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        <p className="text-xs text-[#93C5FD]">
                          Ticket: ₹{event.ticketPrice ?? 0} per person
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Booking form */}
        <section className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
          <h2 className="mb-1 text-lg font-semibold">Book Tickets</h2>
          <p className="mb-4 text-xs text-white/70">
            Send us your details and we’ll confirm your event booking on WhatsApp.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}
            <div>
              <label className="mb-1 block text-xs text-white/70">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/70">Mobile Number</label>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-white/70">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-white/70">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/70">Number of People</label>
              <input
                type="number"
                min={1}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Confirm & Open WhatsApp"}
            </button>
          </form>
        </section>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  );
}

