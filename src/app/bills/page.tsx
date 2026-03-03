"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type Bill = {
  id: string;
  amount: number;
  notes: string | null;
  status: "PENDING" | "PAID";
  createdAt: string;
};

export default function PendingBillsPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    // Require login via session; if not logged in, redirect to /login
    async function init() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.status === 401) {
          router.replace("/login?returnTo=/bills");
          return;
        }
        const data = await res.json();
        const userPhone: string | undefined = data?.user?.phone;
        if (!userPhone) {
          router.replace("/login?returnTo=/bills");
          return;
        }
        setPhone(userPhone);
        await fetchBills(userPhone);
      } catch {
        setError("Failed to verify session.");
      }
    }
    void init();
  }, [router]);

  async function fetchBills(p: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bills/pending?phone=${p}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load bills.");
        setBills([]);
        return;
      }
      setBills(data.bills || []);
    } catch {
      setError("Network error while loading bills.");
      setBills([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-24">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Pending Bills</h1>
            <p className="mt-1 text-xs text-white/70">
              Pending bills linked to your phone number{" "}
              {phone && `(+91 ${phone})`}.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.replace("/");
            }}
            className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80 hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        {bills.length === 0 && !loading && !error && phone && (
          <p className="text-xs text-white/60">
            No pending bills found for this number.
          </p>
        )}

        {info && (
          <p className="mb-3 text-[11px] text-white/60">
            {info}
          </p>
        )}

        <div className="space-y-3">
          {bills.map((bill) => (
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
                  <p className="text-[11px] text-white/60">{bill.notes}</p>
                )}
                <p className="text-[11px] font-semibold text-amber-300">
                  Status: {bill.status}
                </p>
              </div>
              <button
                type="button"
                disabled={bill.status !== "PENDING"}
                onClick={async () => {
                  if (bill.status !== "PENDING") return;
                  try {
                    const amountPaise = bill.amount * 100;
                    const orderRes = await fetch("/api/razorpay/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "bill",
                        amount: amountPaise,
                        currency: "INR",
                        bill: { billId: bill.id },
                      }),
                    });
                    const orderData = await orderRes.json();
                    if (!orderRes.ok || orderData?.error || !orderData?.id) {
                      throw new Error(
                        orderData.error || "Failed to create payment order",
                      );
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const RazorpayConstructor = (window as any).Razorpay;
                    if (!RazorpayConstructor) {
                      throw new Error(
                        "Payment SDK not loaded. Please try again.",
                      );
                    }
                    const options = {
                      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                      amount: amountPaise,
                      currency: "INR",
                      name: "SKYHY Live",
                      description: "Bill payment",
                      order_id: orderData.id,
                      theme: { color: "#eab308" },
                      handler: (
                        response:
                          | { razorpay_payment_id?: string | undefined }
                          | undefined,
                      ) => {
                        const params = new URLSearchParams({
                          status: "paid",
                          total: String(bill.amount),
                          paymentId: response?.razorpay_payment_id || "",
                        });
                        router.push(
                          `/bills/payment-success?${params.toString()}`,
                        );
                      },
                    };
                    const rzp = new RazorpayConstructor(options);
                    rzp.open();
                  } catch (err) {
                    // simple inline error; keep UX minimal
                    alert(
                      err instanceof Error
                        ? err.message
                        : "Failed to start payment. Please try again.",
                    );
                  }
                }}
                className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[11px] font-semibold text-black shadow hover:from-amber-400 hover:to-orange-400 disabled:opacity-60"
              >
                Pay
              </button>
            </div>
          ))}
        </div>
      </div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

