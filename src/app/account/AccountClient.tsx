"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Bill = {
  id: string;
  amount: number;
  notes: string | null;
  status: "PENDING" | "PAID";
  createdAt: string;
};

type Coupon = {
  id: string;
  discountAmount: number | null;
  discountPercent: number | null;
  status: "ACTIVE" | "USED" | "EXPIRED";
  dayKey?: string | null;
  expiresAt?: string | null;
};

type CouponsByStatus = {
  active: Coupon[];
  used: Coupon[];
  expired: Coupon[];
};

type Booking = {
  id: string;
  eventTitle: string | null;
  date: string;
  time: string;
  people: number;
  paymentStatus: string;
};

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialTab =
    searchParams.get("tab") === "payments" ? "payments" : "bookings";

  const [tab, setTab] = useState<"bookings" | "payments">(initialTab);
  const [phone, setPhone] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [coupons, setCoupons] = useState<CouponsByStatus>({
    active: [],
    used: [],
    expired: [],
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponStatusToday, setCouponStatusToday] = useState<
    "available" | "used_today" | "sold_out" | "unknown"
  >("unknown");

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.status === 401) {
          const returnTo = pathname || "/account";
          router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        const sessionData = await sessionRes.json();
        const userPhone: string | undefined = sessionData?.user?.phone;
        if (!userPhone) {
          const returnTo = pathname || "/account";
          router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        setPhone(userPhone);

        const [billsRes, overviewRes] = await Promise.all([
          fetch("/api/bills/pending"),
          fetch("/api/account/overview"),
        ]);

        const billsJson = await billsRes.json();
        if (billsRes.ok) {
          setBills(billsJson.bills || []);
        }

        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          setBookings(overview.bookings || []);
          setCoupons(
            overview.coupons || {
              active: [],
              used: [],
              expired: [],
            },
          );
          if (overview.couponStatusToday) {
            setCouponStatusToday(overview.couponStatusToday);
          }
        }
      } catch {
        setError("Unable to load account details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [pathname, router]);

  const pendingBills = bills.filter((b) => b.status === "PENDING");
  const paidBills = bills.filter((b) => b.status === "PAID");

  return (
    <div className="min-h-screen bg-[#020617] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6 md:pt-8">
        <h1 className="mb-1 text-xl font-semibold">My Bookings & Payments</h1>
        <p className="mb-3 text-[11px] text-white/50">
          Logged in as <span className="font-semibold">+91 {phone}</span>
        </p>

        {/* Coupon availability status */}
        <div className="mb-4">
          {couponStatusToday === "available" && (
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100">
              25% OFF on À la carte is <span className="font-semibold">available</span>{' '}
              for you today (FCFS, 30 coupons/day).
            </div>
          )}
          {couponStatusToday === "used_today" && (
            <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-100">
              You have already used today&apos;s 25% OFF coupon. Try again tomorrow.
            </div>
          )}
          {couponStatusToday === "sold_out" && (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
              Today&apos;s 25% OFF coupons are{' '}
              <span className="font-semibold">sold out</span>. Please try again
              tomorrow.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-4 flex rounded-full bg-black/60 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("bookings")}
            className={`flex-1 rounded-full px-3 py-1.5 ${
              tab === "bookings"
                ? "bg-white text-black font-semibold"
                : "text-white/70"
            }`}
          >
            Bookings
          </button>
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`flex-1 rounded-full px-3 py-1.5 ${
              tab === "payments"
                ? "bg-white text-black font-semibold"
                : "text-white/70"
            }`}
          >
            Payments
          </button>
        </div>

        {loading && <p className="text-xs text-white/60">Loading…</p>}
        {error && !loading && (
          <p className="mb-3 text-xs text-red-400">{error}</p>
        )}

        {!loading && tab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 && (
              <p className="text-xs text-white/60">
                No event bookings linked to this account yet.
              </p>
            )}
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-black/70 px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)]"
              >
                <p className="text-sm font-semibold">
                  {b.eventTitle || "SkyHy Live Event"}
                </p>
                <p className="text-[11px] text-white/60">
                  {new Intl.DateTimeFormat("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(b.date.slice(0, 10) + "T00:00:00"))}{" "}
                  at {b.time}
                </p>
                <p className="mt-1 text-[11px] text-white/60">
                  People: {b.people}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    b.paymentStatus === "PAID"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : b.paymentStatus === "BOOKING_CREATED"
                        ? "bg-sky-500/20 text-sky-200"
                        : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {b.paymentStatus === "PAID"
                    ? "PAID"
                    : b.paymentStatus === "BOOKING_CREATED"
                      ? "BOOKING CREATED"
                      : "PENDING"}
                </span>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === "payments" && (
          <div className="space-y-4">
            {/* Pending bills */}
            <div>
              <p className="mb-1 text-xs font-semibold text-white/70">
                Pending Bills ({pendingBills.length})
              </p>
              {pendingBills.length === 0 && (
                <p className="text-[11px] text-white/50">
                  No pending bills right now.
                </p>
              )}
              <div className="space-y-3">
                {pendingBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-2xl border border-white/12 bg-black/70 px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.8)]"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">₹{bill.amount}</p>
                      <p className="text-[11px] text-white/60">
                        {new Intl.DateTimeFormat("en-IN", {
                          timeZone: "Asia/Kolkata",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(bill.createdAt))}
                      </p>
                      {bill.notes && (
                        <p className="text-[11px] text-white/60">
                          {bill.notes}
                        </p>
                      )}
                      <p className="text-[11px] font-semibold text-amber-300">
                        Status: {bill.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[11px] font-semibold text-black shadow hover:from-amber-400 hover:to-orange-400"
                      onClick={() =>
                        router.push(
                          `/bills?billId=${encodeURIComponent(bill.id)}`,
                        )
                      }
                    >
                      Pay
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Paid bills */}
            <div>
              <p className="mb-1 text-xs font-semibold text-white/70">
                Paid Bills ({paidBills.length})
              </p>
              {paidBills.length === 0 && (
                <p className="text-[11px] text-white/50">
                  No paid bills yet.
                </p>
              )}
              <div className="space-y-3">
                {paidBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-emerald-100">
                        ₹{bill.amount}
                      </p>
                      <p className="text-[11px] text-emerald-100/80">
                        {new Date(bill.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {bill.notes && (
                        <p className="text-[11px] text-emerald-100/80">
                          {bill.notes}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                      PAID
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupons */}
            <div>
              <p className="mb-1 text-xs font-semibold text-white/70">
                My Coupons
              </p>
              {coupons.active.length === 0 &&
                coupons.used.length === 0 &&
                coupons.expired.length === 0 && (
                  <p className="text-[11px] text-white/50">
                    No coupons yet. Book events to unlock discounts.
                  </p>
                )}

              {["ACTIVE", "USED", "EXPIRED"].map((status) => {
                const list =
                  status === "ACTIVE"
                    ? coupons.active
                    : status === "USED"
                    ? coupons.used
                    : coupons.expired;
                if (!list.length) return null;
                return (
                  <div key={status} className="mt-2 space-y-2">
                    <p className="text-[11px] font-semibold text-white/60">
                      {status === "ACTIVE"
                        ? "Active"
                        : status === "USED"
                        ? "Used"
                        : "Expired"}
                    </p>
                    {list.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.8)]"
                      >
                        <p className="text-sm font-semibold text-amber-100">
                          {coupon.discountPercent
                            ? `${coupon.discountPercent}% off`
                            : coupon.discountAmount
                            ? `₹${coupon.discountAmount} off`
                            : "Special discount"}
                        </p>
                        {coupon.dayKey && (
                          <p className="mt-1 text-[11px] text-amber-100/80">
                            Reservation day: {coupon.dayKey}
                          </p>
                        )}
                        {coupon.expiresAt && (
                          <p className="mt-1 text-[11px] text-amber-100/80">
                            Expires on{" "}
                            {new Date(coupon.expiresAt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        )}
                        <span className="mt-2 inline-flex rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                          {coupon.status}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

