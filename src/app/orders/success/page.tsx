import { Suspense } from "react";
import OrdersSuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic";

export default function OrdersSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
          <p className="text-sm text-white/70">Loading payment details…</p>
        </div>
      }
    >
      <OrdersSuccessClient />
    </Suspense>
  );
}

