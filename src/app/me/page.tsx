import { Suspense } from "react";
import AccountClient from "../account/AccountClient";

export const dynamic = "force-dynamic";

export default function MePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
          <p className="text-sm text-white/70">Loading account…</p>
        </div>
      }
    >
      <AccountClient />
    </Suspense>
  );
}

