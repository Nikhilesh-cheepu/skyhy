"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import BillPayCard from "@/components/BillPayCard";
import PageTopBar from "@/components/PageTopBar";

type Bill = {
  id: string;
  amount: number;
  billType?: string;
  notes: string | null;
  status: "PENDING" | "PAID";
  createdAt: string;
};

function PendingBillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
        setLoading(true);
        setError("");
        const billsRes = await fetch("/api/bills/pending");
        const billsJson = await billsRes.json();
        if (!billsRes.ok) {
          setError(billsJson.error || "Failed to load bills.");
          setBills([]);
          return;
        }
        setBills(billsJson.bills || []);
      } catch {
        setError("Failed to verify session.");
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [router]);

  const billIdParam = searchParams.get("billId");

  return (
    <div className="min-h-screen bg-[#020617] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-24">
        <PageTopBar title="Pending Bills" showBack fallbackHref="/" />
        <div className="mb-4 flex items-center justify-between">
          <p className="mt-1 text-xs text-white/70">
            Pending bills for {phone && `+91 ${phone}`}
          </p>
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
        {loading && (
          <p className="text-xs text-white/60">Loading bills…</p>
        )}

        {!loading && bills.length === 0 && !error && phone && (
          <p className="text-xs text-white/60">No pending bills found.</p>
        )}

        <div className="space-y-3">
          {bills.map((bill) => (
            <div
              key={bill.id}
              id={billIdParam === bill.id ? "focused-bill" : undefined}
              className={billIdParam === bill.id ? "ring-1 ring-amber-400/50 rounded-2xl" : ""}
            >
              <BillPayCard bill={bill} />
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

export default function PendingBillsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading…</div>}>
      <PendingBillsContent />
    </Suspense>
  );
}
