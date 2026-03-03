import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function PhoneLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] text-white">
          <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-20 pb-10">
            <p className="text-sm text-white/70">Loading login…</p>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

