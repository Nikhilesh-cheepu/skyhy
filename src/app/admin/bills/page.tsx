"use client";

import { useState, useRef, useEffect } from "react";

const PAY_LINK = "https://www.skyhy.live/me";

function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(0, 10);
  if (digits.length !== 10) return "";
  return "91" + digits;
}

function getWhatsAppUrl(phone: string, amount?: number): string {
  const ph = formatPhoneForWhatsApp(phone);
  if (!ph) return "";
  const message = amount != null
    ? `Hi! Your SKYHY bill of ₹${amount} is ready. Pay here: ${PAY_LINK}`
    : `Hi! Your SKYHY bill is ready. Pay here: ${PAY_LINK}`;
  return `https://wa.me/${ph}?text=${encodeURIComponent(message)}`;
}

type Bill = {
  id: string;
  amount: number;
  notes: string | null;
  status: "PENDING" | "PARTIAL" | "PAID";
  paidAmount?: number;
  paidAt?: string | null;
  billType?: string;
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
  const [suggestions, setSuggestions] = useState<UserSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [billType, setBillType] = useState<"a_la_carte" | "128">("a_la_carte");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [highlightBillId, setHighlightBillId] = useState<string | null>(null);
  const pendingSectionRef = useRef<HTMLDivElement>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editBillType, setEditBillType] = useState<"a_la_carte" | "128">("a_la_carte");
  const [editSaving, setEditSaving] = useState(false);

  const [markPaidBill, setMarkPaidBill] = useState<Bill | null>(null);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);

  const [partialBill, setPartialBill] = useState<Bill | null>(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [partialSaving, setPartialSaving] = useState(false);

  const [deleteBill, setDeleteBill] = useState<Bill | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const suggestionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!highlightBillId) return;
    const t = setTimeout(() => setHighlightBillId(null), 2000);
    return () => clearTimeout(t);
  }, [highlightBillId]);

  async function runSearch(clean: string) {
    setError("");
    setToast(null);
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
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "").slice(0, 10);
    if (clean.length !== 10) {
      setError("Enter a valid 10-digit phone number.");
      setUser(null);
      setBills([]);
      return;
    }
    setPhone(clean);
    await runSearch(clean);
  }

  async function fetchSuggestionsFor(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);
    setError("");
    setToast(null);
    setUser(null);
    setBills([]);

    if (clean.length < 4) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/search?q=${clean}`);
      const data = await res.json();
      if (!res.ok) return;
      const list = (data.users ?? []) as UserSummary[];
      setSuggestions(list);
      setShowSuggestions(list.length > 0);
    } catch {
      // ignore suggestions errors
    }
  }

  function handlePhoneChange(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 10);
    setPhone(clean);
    setError("");
    setToast(null);

    if (suggestionTimeoutRef.current != null) {
      window.clearTimeout(suggestionTimeoutRef.current);
    }

    if (!clean) {
      setUser(null);
      setBills([]);
      setSuggestions([]);
      setShowSuggestions(false);
      suggestionTimeoutRef.current = null;
      return;
    }

    suggestionTimeoutRef.current = window.setTimeout(() => {
      fetchSuggestionsFor(clean);
    }, 200);
  }

  async function handleSelectSuggestion(selectedPhone: string) {
    setPhone(selectedPhone);
    await runSearch(selectedPhone);
  }

  async function handleCreateBill(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setToast(null);
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
          billType,
          notes: notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create bill.");
        return;
      }
      const newBill = data as Bill;
      setBills((prev) => [newBill, ...prev]);
      setAmount("");
      setNotes("");
      setToast("Bill created. Opening WhatsApp…");
      setHighlightBillId(newBill.id);
      pendingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const waUrl = getWhatsAppUrl(phone, amtNumber);
      if (waUrl) window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Network error while creating bill.");
    } finally {
      setCreating(false);
    }
  }

  function handleCopyPayLink() {
    try {
      navigator.clipboard.writeText(PAY_LINK);
      setToast("Pay link copied to clipboard.");
    } catch {
      setError("Could not copy. Copy manually: " + PAY_LINK);
    }
  }

  function handleOpenWhatsApp() {
    if (!user) return;
    const waUrl = getWhatsAppUrl(phone);
    if (waUrl) window.open(waUrl, "_blank", "noopener,noreferrer");
    else setError("Invalid phone number.");
  }

  async function handleEditSave() {
    if (!editBill) return;
    const amt = Number(editAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setToast("Enter a valid amount.");
      return;
    }
    setEditSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bills/${editBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amt),
          billType: editBillType,
          notes: editNotes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setBills((prev) => prev.map((b) => (b.id === editBill.id ? data : b)));
      setToast("Bill updated.");
      setEditBill(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update bill");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleMarkPaidConfirm() {
    if (!markPaidBill) return;
    setMarkPaidLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bills/${markPaidBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setBills((prev) => prev.map((b) => (b.id === markPaidBill.id ? data : b)));
      setToast("Bill marked as PAID.");
      setMarkPaidBill(null);
      setMenuOpenId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setMarkPaidLoading(false);
    }
  }

  async function handlePartialSave() {
    if (!partialBill) return;
    const received = Number(partialAmount);
    if (!Number.isFinite(received) || received < 0 || received > partialBill.amount) {
      setToast("Enter a valid amount received (0 to bill amount).");
      return;
    }
    setPartialSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bills/${partialBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PARTIAL",
          paidAmount: Math.round(received),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setBills((prev) => prev.map((b) => (b.id === partialBill.id ? data : b)));
      setToast("Partial payment saved.");
      setPartialBill(null);
      setPartialAmount("");
      setMenuOpenId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setPartialSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteBill) return;
    setDeleteLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bills/${deleteBill.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setBills((prev) => prev.filter((b) => b.id !== deleteBill.id));
      setToast("Bill deleted.");
      setDeleteBill(null);
      setMenuOpenId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  }

  function openResendWhatsApp(bill: Bill) {
    setMenuOpenId(null);
    const waUrl = getWhatsAppUrl(phone, bill.amount);
    if (waUrl) window.open(waUrl, "_blank", "noopener,noreferrer");
    setToast("Opening WhatsApp…");
  }

  const pendingBills = bills.filter((b) => b.status === "PENDING" || b.status === "PARTIAL");
  const paidBills = bills.filter((b) => b.status === "PAID");

  return (
    <div className="space-y-4 text-sm text-white/90">
      <div className="rounded-2xl border border-white/10 bg-[#050608] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)]">
        <h1 className="text-sm font-semibold text-white">Bills</h1>
        <p className="mt-1 text-xs text-white/60">
          Search by customer phone. Create bills and send the pay link via WhatsApp.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/70 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.9)] md:flex-row md:items-end"
      >
        <div className="relative flex-1 space-y-1">
          <label className="block text-xs text-white/70">Customer phone</label>
          <input
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={10}
            inputMode="numeric"
            className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
            placeholder="10-digit phone"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-black/90 text-xs text-white shadow-2xl">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s.phone)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-white/10"
                >
                  <span className="font-medium">{s.phone}</span>
                  <span className="text-[10px] text-white/50">
                    Created{" "}
                    {new Date(s.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loadingSearch}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-black shadow hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 md:w-auto"
        >
          {loadingSearch ? "Searching…" : "Search user"}
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {toast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-500/95 px-4 py-2 text-xs font-medium text-black shadow-lg">
          {toast}
        </div>
      )}

      {phone && !loadingSearch && !user && (
        <div className="space-y-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="font-semibold">User not found for {phone}.</p>
          <p>
            Ask the customer to log in once on the website with this phone number, then try again.
          </p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.origin + "/reserve" : "");
              setToast("Login link copied.");
            }}
            className="mt-2 inline-flex rounded-full border border-amber-300/40 px-3 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-400/20"
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
              <p className="text-sm font-semibold text-white">{user.phone}</p>
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
                <label className="block text-xs text-white/70">Bill type</label>
                <select
                  value={billType}
                  onChange={(e) =>
                    setBillType(e.target.value as "a_la_carte" | "128")
                  }
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                >
                  <option value="a_la_carte">À la carte (25% coupon eligible)</option>
                  <option value="128">128 (no discount)</option>
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-white/70">Bill amount (₹)</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                  placeholder="Amount in rupees"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-white/70">Notes (optional)</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                  placeholder="Bill details, table no, etc."
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black shadow hover:bg-emerald-400 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create Bill (PENDING)"}
              </button>
              <button
                type="button"
                onClick={handleCopyPayLink}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
              >
                Copy Pay Link
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-500/30"
              >
                Open WhatsApp
              </button>
            </div>
          </form>

          <div ref={pendingSectionRef} className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-white/70">
              Pending / Partial ({pendingBills.length})
            </p>
            {pendingBills.length === 0 && (
              <p className="text-[11px] text-white/50">No pending bills.</p>
            )}
            {pendingBills.map((bill) => {
              const isPartial = bill.status === "PARTIAL";
              const paid = bill.paidAmount ?? 0;
              const balance = bill.amount - paid;
              return (
                <div
                  key={bill.id}
                  className={`relative flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                    highlightBillId === bill.id
                      ? "border-sky-400/60 bg-sky-500/20 ring-2 ring-sky-400/40"
                      : isPartial
                      ? "border-amber-400/40 bg-amber-500/10"
                      : "border-yellow-400/40 bg-yellow-500/10"
                  }`}
                >
                  <div className="space-y-0.5 pr-8">
                    <p className="text-sm font-semibold text-yellow-100">
                      ₹{bill.amount}
                      {isPartial && (
                        <span className="ml-2 text-[11px] font-normal text-yellow-100/90">
                          Paid ₹{paid} · Balance ₹{balance}
                        </span>
                      )}
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
                      <p className="text-[11px] text-yellow-100/80">{bill.notes}</p>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-semibold text-yellow-100">
                      {isPartial ? "PARTIAL" : "PENDING"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === bill.id ? null : bill.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 hover:bg-white/10"
                      aria-label="Actions"
                    >
                      ⋮
                    </button>
                  </div>
                  {menuOpenId === bill.id && (
                    <>
                      {isMobile ? (
                        <div
                          className="fixed inset-0 z-40 bg-black/50"
                          onClick={() => setMenuOpenId(null)}
                        />
                      ) : null}
                      <div
                        className={`absolute right-2 top-10 z-50 min-w-[160px] rounded-xl border border-white/15 bg-slate-900 py-1 shadow-xl ${
                          isMobile ? "bottom-20 left-4 right-4 fixed rounded-2xl p-3" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setEditBill(bill);
                            setEditAmount(String(bill.amount));
                            setEditNotes(bill.notes ?? "");
                            setEditBillType((bill.billType === "128" ? "128" : "a_la_carte") as "a_la_carte" | "128");
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                        >
                          Edit bill
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMarkPaidBill(bill);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                        >
                          Mark as Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPartialBill(bill);
                            setPartialAmount(String(bill.paidAmount ?? 0));
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                        >
                          Partially Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => openResendWhatsApp(bill)}
                          className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                        >
                          Resend WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteBill(bill);
                            setMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/20"
                        >
                          Delete bill
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
                className="relative flex items-center justify-between rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2"
              >
                <div className="space-y-0.5 pr-8">
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
                    <p className="text-[11px] text-emerald-100/80">{bill.notes}</p>
                  )}
                </div>
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                    PAID
                  </span>
                  <button
                    type="button"
                    onClick={() => setMenuOpenId(menuOpenId === bill.id ? null : bill.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 hover:bg-white/10"
                    aria-label="Actions"
                  >
                    ⋮
                  </button>
                </div>
                {menuOpenId === bill.id && (
                  <>
                    {isMobile && (
                      <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setMenuOpenId(null)}
                      />
                    )}
                    <div
                      className={`absolute right-2 top-10 z-50 min-w-[160px] rounded-xl border border-white/15 bg-slate-900 py-1 shadow-xl ${
                        isMobile ? "bottom-20 left-4 right-4 fixed rounded-2xl p-3" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditBill(bill);
                          setEditAmount(String(bill.amount));
                          setEditNotes(bill.notes ?? "");
                          setEditBillType((bill.billType === "128" ? "128" : "a_la_carte") as "a_la_carte" | "128");
                          setMenuOpenId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10"
                      >
                        View / Edit notes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteBill(bill);
                          setMenuOpenId(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900 p-4 shadow-xl">
            <p className="text-sm font-semibold text-white">Edit bill</p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] text-white/70">Bill type</label>
                <select
                  value={editBillType}
                  onChange={(e) => setEditBillType(e.target.value as "a_la_carte" | "128")}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                >
                  <option value="a_la_carte">À la carte</option>
                  <option value="128">128</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-white/70">Amount (₹)</label>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/70">Notes</label>
                <input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditBill(null)}
                className="flex-1 rounded-xl border border-white/20 py-2 text-sm font-medium text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid confirm */}
      {markPaidBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900 p-4 shadow-xl">
            <p className="text-sm font-semibold text-white">Mark this bill as PAID?</p>
            <p className="mt-1 text-xs text-white/60">₹{markPaidBill.amount}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setMarkPaidBill(null)}
                className="flex-1 rounded-xl border border-white/20 py-2 text-sm font-medium text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkPaidConfirm}
                disabled={markPaidLoading}
                className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                {markPaidLoading ? "Updating…" : "Mark PAID"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partially Paid modal */}
      {partialBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900 p-4 shadow-xl">
            <p className="text-sm font-semibold text-white">Partially Paid</p>
            <p className="mt-1 text-xs text-white/60">Bill total: ₹{partialBill.amount}</p>
            <div className="mt-3 space-y-2">
              <label className="block text-[11px] text-white/70">Amount received (₹)</label>
              <input
                type="number"
                min={0}
                max={partialBill.amount}
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
              />
              <p className="text-[11px] text-white/50">
                Balance: ₹{Math.max(0, partialBill.amount - (Number(partialAmount) || 0))}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setPartialBill(null); setPartialAmount(""); }}
                className="flex-1 rounded-xl border border-white/20 py-2 text-sm font-medium text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePartialSave}
                disabled={partialSaving}
                className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                {partialSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900 p-4 shadow-xl">
            <p className="text-sm font-semibold text-white">Delete this bill?</p>
            <p className="mt-1 text-xs text-white/60">This cannot be undone.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteBill(null)}
                className="flex-1 rounded-xl border border-white/20 py-2 text-sm font-medium text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
