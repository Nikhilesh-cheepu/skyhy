"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

const RESEND_COOLDOWN_SEC = 30;

function friendlyAuthMessage(code: string, fallback: string): string {
  const map: Record<string, string> = {
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/invalid-phone-number": "Please enter a valid 10-digit mobile number.",
    "auth/captcha-check-failed": "Security check failed. Please refresh and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/invalid-verification-code": "Invalid or expired OTP. Please try again or request a new one.",
    "auth/code-expired": "OTP expired. Please request a new one.",
  };
  return map[code] ?? fallback;
}

export default function PhoneLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [, setSendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const confirmationResultRef =
    useRef<import("firebase/auth").ConfirmationResult | null>(null);

  const returnTo = searchParams.get("returnTo") || "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const clean = phone.replace(/\D/g, "").slice(0, 10);
    if (clean.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setPhone(clean);
    setLoading(true);
    setSendStatus("sending");
    try {
      const verifier = window.recaptchaVerifier!;
      const fullPhone = `+91${clean}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, verifier);
      confirmationResultRef.current = confirmationResult;
      setStep("otp");
      setSendStatus("sent");
      setResendCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      const message =
        err && typeof (err as { code?: string }).code === "string"
          ? friendlyAuthMessage((err as { code: string }).code, "Failed to send OTP. Please try again.")
          : err instanceof Error
            ? friendlyAuthMessage("", err.message)
            : "Failed to send OTP. Please try again.";
      setError(message);
      setSendStatus("idle");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!confirmationResultRef.current) {
      setError("Please request an OTP first.");
      return;
    }
    if (!otp.trim() || otp.trim().length < 4) {
      setError("Enter the OTP you received.");
      return;
    }
    setLoading(true);
    try {
      await confirmationResultRef.current.confirm(otp.trim());

      const res = await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(returnTo);
      router.refresh();
    } catch (err) {
      const message =
        err && typeof (err as { code?: string }).code === "string"
          ? friendlyAuthMessage((err as { code: string }).code, "OTP verification failed. Please try again.")
          : err instanceof Error
            ? err.message
            : "OTP verification failed. Please try again.";
      setError(
        message.startsWith("auth/") ? "OTP verification failed. Please try again." : message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-20 pb-10">
        <h1 className="mb-2 text-xl font-semibold">Login to SKYHY</h1>
        <p className="mb-6 text-xs text-white/70">
          Login with your phone number to reserve, checkout, or view pending
          bills.
        </p>

        {error && (
          <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs text-white/70">
                Mobile Number (India)
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 px-3 py-2">
                <span className="text-sm text-white/70">+91</span>
                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full bg-transparent text-sm text-white outline-none"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <p className="text-xs text-white/60">
              OTP sent to +91 {phone}. Enter it below to continue.
            </p>
            <div className="space-y-1">
              <label className="block text-xs text-white/70">OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-sm text-white"
                placeholder="6-digit OTP"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
            <div className="flex justify-center">
              {resendCooldown > 0 ? (
                <span className="text-xs text-white/50">
                  Resend OTP in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setError("");
                    handleSendOtp(e as unknown as React.FormEvent);
                  }}
                  disabled={loading}
                  className="text-xs text-[#60A5FA] hover:underline disabled:opacity-60"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}

