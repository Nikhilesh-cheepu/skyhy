 "use client";

import { useSearchParams } from "next/navigation";

const WHATSAPP_NUMBER = "7013884485";

export default function BillsSuccessClient() {
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "paid";
  const total = searchParams.get("total") || "0";
  const paymentId = searchParams.get("paymentId") || "";

  const isPaid = status === "paid";

  function handleWhatsApp() {
    const lines = [
      "SKYHY Bill Payment Confirmation:",
      isPaid ? `Total Paid: ₹${total}` : `Total: ₹${total}`,
      isPaid && paymentId ? `Payment ID: ${paymentId}` : "",
      isPaid ? "Status: PAID via Razorpay" : "Status: Confirmed",
    ].filter(Boolean);
    const waText = encodeURIComponent(lines.join("\n"));
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;
  }

  return (
    <div className="min-h-screen bg-[#020617] pb-24 text-white">
      <div className="mx-auto flex max-w-md flex-col px-4 pt-6 md:pt-8">
        <div className="rounded-3xl border border-white/10 bg-black/60 px-4 pb-5 pt-5 shadow-[0_18px_45px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
              ✓
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                Bill {isPaid ? "Paid" : "Saved"}
              </p>
              <h1 className="text-base font-semibold">Your SKYHY Bill</h1>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-white/70">
            <p>
              <span className="text-white/50">Total:</span> ₹{total}
            </p>
            {isPaid && paymentId && (
              <p>
                <span className="text-white/50">Payment ID:</span> {paymentId}
              </p>
            )}
            <p className="pt-1 text-[11px] text-emerald-300">
              {isPaid
                ? "Payment received via Razorpay. Thank you for visiting SKYHY."
                : "Bill saved. No payment required."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black shadow hover:bg-emerald-400"
          >
            Send confirmation on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

