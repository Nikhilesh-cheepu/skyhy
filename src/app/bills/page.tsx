"use client";

import { useEffect, useState } from "react";

type Bill = {
  id: string;
  amount: number;
  notes: string | null;
  status: "PENDING" | "PAID";
  createdAt: string;
};

export default function PendingBillsPage() {
  const [phone, setPhone] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("skyhy_phone");
    if (stored && /^\d{10}$/.test(stored)) {
      setPhone(stored);
      void fetchBills(stored);
    }
  }, []);

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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "").slice(0, 10);
    if (clean.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      setBills([]);
      return;
    }
    setPhone(clean);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("skyhy_phone", clean);
    }
    await fetchBills(clean);
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-24">
        <h1 className="mb-2 text-xl font-semibold">Pending Bills</h1>
        <p className="mb-4 text-xs text-white/70">
          Enter your phone number used at SKYHY to view and pay pending bills.
        </p>

        <form
          onSubmit={handleSearch}
          className="mb-4 flex gap-2 rounded-2xl border border-white/10 bg-black/60 p-3"
        >
          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            maxLength={10}
            inputMode="numeric"
            className="flex-1 rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
            placeholder="10-digit phone"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-3 py-2 text-xs font-semibold text-white shadow disabled:opacity-60"
          >
            {loading ? "Loading…" : "View"}
          </button>
        </form>

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

