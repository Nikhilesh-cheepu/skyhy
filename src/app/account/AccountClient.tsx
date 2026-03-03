"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
};

type Booking = {
  id: string;
  eventTitle: string | null;
  date: string;
  people: number;
  paymentStatus: string;
};

export default function AccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "payments" ? "payments" : "bookings";

  const [tab, setTab] = useState<"bookings" | "payments">(initialTab);
  const [phone, setPhone] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.status === 401) {
          router.replace("/login?returnTo=/account");
          return;
        }
        const sessionData = await sessionRes.json();
        const userPhone: string | undefined = sessionData?.user?.phone;
        if (!userPhone) {
          router.replace("/login?returnTo=/account");
          return;
        }
        setPhone(userPhone);

        const [billsRes, overviewRes] = await Promise.all([
          fetch(`/api/bills/pending?phone=${userPhone}`),
          fetch("/api/account/overview"),
        ]);

        const billsJson = await billsRes.json();
        if (billsRes.ok) {
          setBills(billsJson.bills || []);
        }

        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          setBookings(overview.bookings || []);
          setCoupon(overview.coupon || null);
        }
      } catch {
        setError("Unable to load account details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const pendingBills = bills.filter((b) => b.status === "PENDING");
  const paidBills = bills.filter((b) => b.status === "PAID");

  return (
    <div className="min-h-screen bg-[#020617] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-24">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs text-white/70"
          >
            ← Back
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            My Account
          </p>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.replace("/");
            }}
            className="text-xs text-white/70"
          >
            Logout
          </button>
        </div>

        <h1 className="mb-2 text-xl font-semibold">My Bookings & Payments</h1>
        <p className="mb-3 text-xs text-white/70">
          Logged in as <span className="font-semibold">+91 {phone}</span>
        </p>

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
                  {new Date(b.date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-1 text-[11px] text-white/60">
                  People: {b.people}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    b.paymentStatus === "PAID"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {b.paymentStatus === "PAID" ? "PAID" : "PENDING"}
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
                        {new Date(bill.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
              {!coupon && (
                <p className="text-[11px] text-white/50">No active coupons.</p>
              )}
              {coupon && (
                <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.8)]">
                  <p className="text-sm font-semibold text-amber-100">
                    {coupon.discountPercent
                      ? `${coupon.discountPercent}% off`
                      : coupon.discountAmount
                      ? `₹${coupon.discountAmount} off`
                      : "Special discount"}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-100/80">
                    Auto-applies during bill payment.
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                    {coupon.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

