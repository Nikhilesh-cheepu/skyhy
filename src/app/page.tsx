"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import OffersCarousel from "@/components/OffersCarousel";
import MenuGalleryCarousel from "@/components/MenuGalleryCarousel";
import AnnouncementBar from "@/components/AnnouncementBar";
import BottomActionBar from "@/components/BottomActionBar";

const HERO_VIDEO_URL =
  "https://cdia7zfhwb3nrsg2.public.blob.vercel-storage.com/hero%20videos/hero-portrait%20copy.mp4";

const CORPORATE_WHATSAPP_URL =
  "https://wa.me/7013884485?text=" +
  encodeURIComponent(
    "Hi SKYHY, I want to enquire about Corporate Packages (20+ people) with Unlimited Buffet. Please share details.",
  );

export default function HomePage() {
  const [heroVideoError, setHeroVideoError] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  return (
    <div className="min-h-screen bg-black relative scroll-smooth overflow-x-hidden w-full max-w-full pb-24">
      {/* Section 1: Light Background with subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      
      {/* Main container */}
      <div className="min-h-screen bg-black">
        {/* Shiny black background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Unified Container */}
        <div className="relative min-h-screen">
          {/* Announcement Bar - Below Navbar, Above Hero */}
          <div className="fixed left-0 right-0 top-16 z-40 md:top-24">
            <AnnouncementBar />
          </div>

          {/* Hero Section - Edge-to-edge, Below Navbar + Announcement */}
          <section id="home" className="relative z-10 w-full pt-[7rem] md:pt-[8.5rem]">
            <div className="w-screen relative left-1/2 -ml-[50vw] -mr-[50vw] max-w-none overflow-hidden">
              <div
                className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl h-[70vh] min-h-[520px] sm:h-[80vh] md:h-[75vh] bg-gradient-to-br from-gray-900 via-black to-gray-900"
                style={{ minHeight: 520 }}
              >
                {heroVideoError ? (
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900"
                    aria-hidden
                  />
                ) : (
                  <video
                    className={`block w-full h-full object-cover object-center motion-reduce:hidden transition-opacity duration-500 ${heroVideoReady ? "opacity-100" : "opacity-0"}`}
                    style={{ filter: "brightness(0.8)" }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={() => setHeroVideoReady(true)}
                    onCanPlay={() => setHeroVideoReady(true)}
                    onError={() => setHeroVideoError(true)}
                    src={HERO_VIDEO_URL}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              </div>
            </div>
          </section>

          {/* Compact highlights: Live Music + ₹128 */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="px-4 pt-8"
          >
            <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Live music card */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg backdrop-blur">
                <div className="mb-3 inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF]">
                    🎵
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Live Music
                  </p>
                </div>
                <h2 className="mb-1 text-lg font-bold text-white">
                  Live Band, Every Single Day
                </h2>
                <p className="mb-3 text-xs text-white/70">
                  High‑energy bands and artists every night on the SKYHY stage.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.instagram.com/skyhylive?utm_source=ig_web_button_share_sheet&igsh=MW0zZGtreHRnMHh2ag=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-[#F472B6] hover:bg-white/10"
                  >
                    Check Instagram
                    <span>↗</span>
                  </a>
                  <Link href="/events">
                    <button className="inline-flex items-center gap-1 rounded-full border border-white/25 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/10">
                      View Events &amp; Book Tickets
                      <span>→</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* ₹128 offer card */}
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#111827] via-[#020617] to-[#0F172A] p-4 shadow-lg">
                <div className="mb-3 inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white">
                    🔥
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Happy Hours
                  </p>
                </div>
                <h2 className="mb-1 text-lg font-bold text-white">
                  Eat &amp; Drink Anything @₹128
                </h2>
                <p className="mb-1 text-xs font-semibold text-[#93C5FD]">
                  12:00 PM – 8:00 PM
                </p>
                <p className="mb-3 text-xs text-white/70">
                  Pick from a special menu and enjoy every item at just ₹128.
                </p>
                <Link href="/packages-menu?tab=menu">
                  <button className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-4 py-2 text-xs font-semibold text-white shadow hover:from-[#1D4ED8] hover:to-[#2563EB]">
                    View Menu
                    <span>→</span>
                  </button>
                </Link>
              </div>

              {/* Corporate packages card */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg backdrop-blur">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white">
                      💼
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Corporate
                    </p>
                  </div>
                  <span className="rounded-full bg-[#22C55E]/10 px-2 py-1 text-[10px] font-semibold text-[#BBF7D0] border border-[#22C55E]/40">
                    Up to 60% Savings
                  </span>
                </div>
                <h2 className="mb-1 text-lg font-bold text-white">
                  Corporate Packages
                </h2>
                <p className="mb-1 text-xs text-white/70">For 20+ people</p>
                <p className="mb-3 text-xs font-medium text-[#BBF7D0]">
                  Unlimited Buffet
                </p>
                <a
                  href={CORPORATE_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-2 text-xs font-semibold text-[#022C22] shadow hover:from-[#16A34A] hover:to-[#16A34A]"
                >
                  Enquire Now
                  <span>↗</span>
                </a>
              </div>
            </div>
          </motion.section>

          {/* Offers & Discounts carousel */}
          <OffersCarousel />


          {/* Menu Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            id="menu"
            className="py-12 px-4"
          >
            
            <div className="relative max-w-7xl mx-auto">
              {/* Menu Header */}
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-white leading-tight mb-6"
                >
                  OUR <span className="text-[#2563EB]">MENU</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="text-xl md:text-2xl text-white/80 font-[family-name:var(--font-inter)] font-medium"
                >
                  A Taste of Our Delicious Menu
                </motion.p>
              </div>

              {/* Food Images Collage */}
              <div className="flex justify-center mb-6">
                {[
                  '/menu preview cards/IMG_9053.jpg',
                  '/menu preview cards/IMG_9055.jpg',
                  '/menu preview cards/IMG_9056.jpg',
                  '/menu preview cards/IMG_9058.jpg',
                  '/menu preview cards/IMG_9059.jpg'
                ].map((imagePath, index) => (
                  <div 
                    key={imagePath} 
                    className="relative w-24 h-32 md:w-28 md:h-40 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 overflow-hidden border-2 border-white/30"
                    style={{
                      transform: `rotate(${(index - 2) * 3}deg) translateY(${Math.abs(index - 2) * 2}px)`,
                      zIndex: 5 - Math.abs(index - 2),
                      marginLeft: index > 0 ? '-8px' : '0',
                      boxShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(37, 99, 235, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden border border-white/20">
                      <Image 
                        src={imagePath} 
                        alt={`Menu item ${index + 1}`} 
                        width={112}
                        height={160}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm" style={{display: 'none'}}>
                        🍽️
                      </div>
                    </div>
                  </div>
        ))}
      </div>

              {/* Menu gallery from admin */}
              <MenuGalleryCarousel />

              {/* View Menu Button */}
              <div className="text-center mt-4 relative z-10">
                <Link 
                  href="/menu" 
                  className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2 relative z-20 cursor-pointer text-sm"
                  style={{ zIndex: 20 }}
                >
                  <span>🍽️</span>
                  View Complete Menu
                </Link>
              </div>
            </div>
        </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />

      <BottomActionBar />
    </div>
  );
}