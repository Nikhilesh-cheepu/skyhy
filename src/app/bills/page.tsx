"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        <h1 className="mb-2 text-xl font-semibold">Pending Bills</h1>
        <p className="mb-4 text-xs text-white/70">
          Pending bills linked to your phone number {phone && `(+91 ${phone})`}.
        </p>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        {bills.length === 0 && !loading && !error && phone && (
          <p className="text-xs text-white/60">
            No pending bills found for this number.
          </p>
        )}

        <div className="space-y-3">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/70 px-3 py-3"
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
              </div>
              <button
                type="button"
                className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-black shadow"
              >
                Pay (coming soon)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

