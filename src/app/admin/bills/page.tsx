"use client";

import { useState } from "react";

type Bill = {
  id: string;
  amount: number;
  notes: string | null;
  status: "PENDING" | "PAID";
  createdAt: string;
};

type UserSummary = {
  id: string;
  phone: string;
  createdAt: string;
};

export default function AdminBillsPage() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<UserSummary | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const clean = phone.replace(/\D/g, "").slice(0, 10);
    if (clean.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      setUser(null);
      setBills([]);
      return;
    }
    setPhone(clean);
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/admin/bills?phone=${clean}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to search user.");
        setUser(null);
        setBills([]);
        return;
      }
      setUser(data.user);
      setBills(data.bills || []);
    } catch {
      setError("Network error while searching.");
      setUser(null);
      setBills([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleCreateBill(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSuccess("");
    const amtNumber =
      amount.trim() === "" ? NaN : Number.parseInt(amount.trim(), 10);
    if (!Number.isFinite(amtNumber) || amtNumber <= 0) {
      setError("Enter a valid bill amount (in rupees).");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: amtNumber,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create bill.");
        return;
      }
      setSuccess("Bill created as PENDING.");
      setAmount("");
      setNotes("");
      setBills((prev) => [data, ...prev]);
    } catch {
      setError("Network error while creating bill.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopyLoginLink() {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/reserve`;
      await navigator.clipboard.writeText(link);
      setSuccess("Login link copied. Share it with the customer on WhatsApp.");
    } catch {
      setError("Unable to copy link. Please copy the URL manually.");
    }
  }

  const pendingBills = bills.filter((b) => b.status === "PENDING");
  const paidBills = bills.filter((b) => b.status === "PAID");

  return (
    <div className="space-y-4 text-sm text-white/90">
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.9)]">
        <h1 className="text-sm font-semibold text-white">Bills</h1>
        <p className="mt-1 text-xs text-white/60">
          Search by customer phone. You can only create bills for users who
          have logged in at least once.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.9)] md:flex-row md:items-end"
      >
        <div className="flex-1 space-y-1">
          <label className="block text-xs text-white/70">Customer phone</label>
          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            maxLength={10}
            inputMode="numeric"
            className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
            placeholder="10-digit phone"
          />
        </div>
        <button
          type="submit"
          disabled={loadingSearch}
          className="w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow md:w-auto"
        >
          {loadingSearch ? "Searching…" : "Search user"}
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">{success}</p>}

      {/* User result + create bill */}
      {phone && !loadingSearch && !user && (
        <div className="space-y-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="font-semibold">User not found for {phone}.</p>
          <p>
            Ask the customer to login once on the website with this phone
            number. Then try again.
          </p>
          <button
            type="button"
            onClick={handleCopyLoginLink}
            className="mt-2 inline-flex items-center justify-center rounded-full border border-amber-300/40 px-3 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-400/20"
          >
            Copy login link
          </button>
        </div>
      )}

      {user && (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs text-white/60">User</p>
              <p className="text-sm font-semibold text-white">
                {user.phone}
              </p>
              <p className="text-[11px] text-white/50">
                Created{" "}
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateBill} className="mt-3 space-y-2 rounded-xl bg-black/60 p-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-white/70">
                  Bill amount (₹)
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                  placeholder="Amount in rupees"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-white/70">
                  Notes (optional)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                  placeholder="Bill details, table no, etc."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black shadow hover:bg-emerald-400 disabled:opacity-60"
            >
              {creating ? "Creating bill…" : "Create Bill (PENDING)"}
            </button>
          </form>

          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-white/70">
              Pending bills ({pendingBills.length})
            </p>
            {pendingBills.length === 0 && (
              <p className="text-[11px] text-white/50">No pending bills.</p>
            )}
            {pendingBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-xl border border-yellow-400/40 bg-yellow-500/10 px-3 py-2"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-yellow-100">
                    ₹{bill.amount}
                  </p>
                  <p className="text-[11px] text-yellow-100/80">
                    {new Date(bill.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {bill.notes && (
                    <p className="text-[11px] text-yellow-100/80">
                      {bill.notes}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-semibold text-yellow-100">
                  PENDING
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-white/70">
              Paid bills ({paidBills.length})
            </p>
            {paidBills.length === 0 && (
              <p className="text-[11px] text-white/50">No paid bills yet.</p>
            )}
            {paidBills.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2"
              >
                <div className="space-y-0.5">
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
      )}
    </div>
  );
}

