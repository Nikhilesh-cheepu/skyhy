"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, hasMounted]);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 right-0 z-40"
      style={{ top: 0 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 md:mt-8">
        <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] pl-4 pr-3 py-3 md:pl-6 md:pr-4 md:py-4">
          {/* Left: Logo bubble */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-2 py-1 shadow-md">
              <span className="text-[#0B5BFF] font-[family-name:var(--font-inter)] font-extrabold text-sm">BASE</span>
              <span className="bg-[#0B5BFF] text-white rounded-full px-2 py-0.5 font-[family-name:var(--font-inter)] font-extrabold text-sm">CLUB</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 pr-1">
            <Link href="/" className="font-[family-name:var(--font-inter)] font-semibold text-white hover:text-white/80 transition-all duration-300">About Club</Link>
            <Link
              href="/"
              className="font-[family-name:var(--font-inter)] font-semibold text-white hover:text-white/80 transition-all duration-300"
            >
              My stats
            </Link>
            <Link
              href="/"
              className="font-[family-name:var(--font-inter)] font-semibold text-white hover:text-white/80 transition-all duration-300"
            >
              Tokenomic
            </Link>
            <Link
              href="/"
              className="font-[family-name:var(--font-inter)] font-semibold text-white hover:text-white/80 transition-all duration-300"
            >
              Airdrop
            </Link>
            <button className="bg-transparent border-2 border-white rounded-lg px-4 py-2 text-white font-[family-name:var(--font-inter)] font-semibold hover:bg-white hover:text-[#0C1222] transition-all duration-300">
              Connect wallet
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden p-2 text-cloud focus:outline-none"
          >
            <motion.span
              initial={false}
              animate={isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-cloud mb-1"
            />
            <motion.span
              initial={false}
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-6 h-0.5 bg-cloud mb-1"
            />
            <motion.span
              initial={false}
              animate={isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-6 h-0.5 bg-cloud"
            />
          </button>
        </div>

        {/* Mobile dropdown under navbar */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden overflow-hidden mt-3 rounded-xl border border-white/20 bg-white/15 backdrop-blur-xl shadow-lg"
            >
              <div className="py-2">
                <Link href="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 font-[family-name:var(--font-inter)] text-white hover:text-white/80 hover:bg-white/20 transition-all duration-300">About Club</Link>
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 font-[family-name:var(--font-inter)] text-white hover:text-white/80 hover:bg-white/20 transition-all duration-300"
                >
                  My stats
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 font-[family-name:var(--font-inter)] text-white hover:text-white/80 hover:bg-white/20 transition-all duration-300"
                >
                  Tokenomic
                </Link>
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 font-[family-name:var(--font-inter)] text-white hover:text-white/80 hover:bg-white/20 transition-all duration-300"
                >
                  Airdrop
                </Link>
                <div className="px-4 py-3">
                  <button className="w-full bg-transparent border-2 border-white rounded-lg px-4 py-2 text-white font-[family-name:var(--font-inter)] font-semibold hover:bg-white hover:text-[#0C1222] transition-all duration-300">
                    Connect wallet
                  </button>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}


