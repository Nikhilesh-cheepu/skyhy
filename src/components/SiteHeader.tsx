"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

type SessionUser = { phone?: string | null } | null;

function maskPhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return digits;
  const last = digits.slice(-4);
  return `${"X".repeat(Math.max(0, digits.length - 4))}${last}`;
}

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const json = await res.json();
        setUser(json?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }
    void loadSession();
  }, []);

  const goToAccount = () => {
    if (user?.phone) {
      router.push("/me");
    } else {
      const ret = pathname || "/me";
      router.push(`/login?returnTo=${encodeURIComponent(ret)}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const showBack =
    pathname !== "/" &&
    pathname != null &&
    !pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:top-4 md:left-4 md:right-4">
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-none md:rounded-xl shadow-lg px-4 md:px-2 max-w-6xl mx-auto h-16 md:h-20 flex items-center">
        <div className="flex items-center justify-between w-full relative">
          {/* Left: optional back button */}
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 md:h-10 md:w-10"
                aria-label="Go back"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Center: logo */}
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          >
            <Image
              src="/logo/shyhy-logo-white.png"
              alt="SKYHY"
              width={200}
              height={68}
              className="h-10 md:h-14 w-auto"
            />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() =>
                document.getElementById("about")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
            >
              About
            </button>
            <Link
              href="/packages-menu"
              className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
            >
              Packages &amp; Menu
            </Link>
            <Link
              href="/reserve"
              className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
            >
              Reserve
            </Link>
            <button
              type="button"
              onClick={goToAccount}
              className="text-[11px] font-[family-name:var(--font-inter)] font-medium text-white/80 hover:text-[#B6FF00] transition-all duration-300"
            >
              My Bookings &amp; Payments
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2"
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-40 md:hidden md:top-20 md:left-4 md:right-4"
        >
          <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-xl shadow-lg p-4 max-w-6xl mx-auto">
            <nav className="flex flex-col items-center space-y-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setIsMobileMenuOpen(false);
                }}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                About
              </button>
              <Link
                href="/packages-menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Packages &amp; Menu
              </Link>
              <Link
                href="/reserve"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Reserve
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  goToAccount();
                }}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                My Bookings &amp; Payments
              </button>
              <div className="mt-2 w-full border-t border-white/20 pt-3 text-center text-xs text-white/80">
                {loadingUser ? (
                  <span>Checking login…</span>
                ) : user?.phone ? (
                  <div className="space-y-2">
                    <p>
                      Logged in: +91 {maskPhone(user.phone)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        void handleLogout();
                      }}
                      className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const ret = pathname || "/";
                      router.push(
                        `/login?returnTo=${encodeURIComponent(ret)}`,
                      );
                      setIsMobileMenuOpen(false);
                    }}
                    className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
                  >
                    Login
                  </button>
                )}
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
}

