import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic";

export default function EventBookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] pb-24 text-white">
          <div className="mx-auto flex max-w-md flex-col px-4 pt-24">
            <p className="text-sm text-white/70">Loading booking details…</p>
          </div>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}

