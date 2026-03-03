"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Bill = {
  id: string;
  amount: number;
  billType?: string;
  notes: string | null;
  status: "PENDING" | "PAID";
  createdAt: string;
};

type ClaimInfo = {
  discount: number;
  holdExpiresAt: string;
  finalAmountRupees: number;
};

export default function BillPayCard({ bill }: { bill: Bill }) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [claimError, setClaimError] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [releasing, setReleasing] = useState(false);

  const isAlaCarte = bill.billType === "a_la_carte";
  const finalAmount = claimInfo?.finalAmountRupees ?? bill.amount;

  useEffect(() => {
    if (!claimInfo) return;
    const expires = new Date(claimInfo.holdExpiresAt).getTime();
    const tick = () => {
      const left = Math.max(0, Math.ceil((expires - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        void fetch("/api/coupons/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ billId: bill.id }),
        }).finally(() => {
          setClaimInfo(null);
          setCountdown(null);
          setClaimError("");
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [claimInfo, bill.id]);

  async function releaseClaim() {
    if (!claimInfo || releasing) return;
    setReleasing(true);
    try {
      await fetch("/api/coupons/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: bill.id }),
      });
    } catch {
      /* ignore */
    }
    setClaimInfo(null);
    setCountdown(null);
    setClaimError("");
    setReleasing(false);
  }

  async function handleApplyCoupon() {
    setClaiming(true);
    setClaimError("");
    try {
      const res = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: bill.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimError(
          data.message ||
            (data.error === "already_used_today"
              ? "Coupon already applied for you for this day. Please try again after 24 hours."
              : data.error === "quota_full"
                ? "No coupons left for today. Please try again tomorrow."
                : "Could not apply coupon. Please try again.")
        );
        return;
      }
      setClaimInfo({
        discount: data.discount,
        holdExpiresAt: data.holdExpiresAt,
        finalAmountRupees: data.finalAmountRupees,
      });
    } catch {
      setClaimError("Failed to apply coupon. Please try again.");
    } finally {
      setClaiming(false);
    }
  }

  async function handlePay() {
    if (bill.status !== "PENDING") return;
    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bill",
          currency: "INR",
          bill: { billId: bill.id },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || orderData?.error || !orderData?.id) {
        throw new Error(orderData.error || "Failed to create payment order");
      }
      const amountPaise = orderData.amount ?? Math.round(finalAmount * 100);
      const totalPaid = orderData.finalAmountRupees ?? amountPaise / 100;
      const RazorpayConstructor = (window as unknown as { Razorpay?: new (o: object) => { open: () => void } }).Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Payment SDK not loaded. Please try again.");
      }
      const rzp = new RazorpayConstructor({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency: "INR",
        name: "SKYHY Live",
        description: "Bill payment",
        order_id: orderData.id,
        theme: { color: "#eab308" },
        handler: (
          response: { razorpay_payment_id?: string } | undefined
        ) => {
          const params = new URLSearchParams({
            status: "paid",
            total: String(totalPaid),
            paymentId: response?.razorpay_payment_id || "",
          });
          router.push(`/bills/payment-success?${params.toString()}`);
        },
      });
      rzp.open();
    } catch {
      alert("Payment could not be started. Please try again.");
    }
  }

  if (bill.status !== "PENDING") {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/12 bg-black/70 px-3 py-3">
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
            <p className="text-[11px] text-white/60">{bill.notes}</p>
          )}
          <p className="text-[11px] font-semibold text-amber-300">
            Status: {bill.status}
          </p>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-1 text-[10px]">
          {bill.status}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/12 bg-black/70 px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.8)]">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">₹{bill.amount}</p>
            {bill.billType && (
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                {bill.billType === "a_la_carte" ? "À la carte" : bill.billType}
              </span>
            )}
          </div>
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
            <p className="text-[11px] text-white/60">{bill.notes}</p>
          )}
          {claimInfo && (
            <p className="text-xs font-semibold text-emerald-400">
              25% off applied! Pay ₹{finalAmount}
              {countdown !== null && countdown > 0 && (
                <span className="ml-2 text-white/60">
                  (expires in {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, "0")})
                </span>
              )}
            </p>
          )}
          {claimError && (
            <p className="text-[11px] text-red-400">{claimError}</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {isAlaCarte && !claimInfo && (
          <button
            type="button"
            disabled={claiming}
            onClick={handleApplyCoupon}
            className="rounded-full border border-amber-400/60 px-3 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-60"
          >
            {claiming ? "Applying…" : "25% off À la carte"}
          </button>
        )}
        {claimInfo && (
          <button
            type="button"
            disabled={releasing}
            onClick={releaseClaim}
            className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white/70 hover:bg-white/10 disabled:opacity-60"
          >
            Remove coupon
          </button>
        )}
        <button
          type="button"
          onClick={handlePay}
          className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[11px] font-semibold text-black shadow hover:from-amber-400 hover:to-orange-400"
        >
          Pay ₹{finalAmount}
        </button>
      </div>
    </div>
  );
}
