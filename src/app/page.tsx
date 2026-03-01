"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import PackagesGrid from "@/components/PackagesGrid";
import Footer from "@/components/Footer";

const HERO_VIDEO_URL =
  "https://cdia7zfhwb3nrsg2.public.blob.vercel-storage.com/hero%20videos/hero-portrait%20copy.mp4";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroVideoError, setHeroVideoError] = useState(false);

  return (
    <div className="min-h-screen bg-black relative scroll-smooth overflow-x-hidden w-full max-w-full">
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
          
          {/* Section 3: Navbar fixed at top */}
          <div className="fixed top-0 left-0 right-0 z-50 md:top-4 md:left-4 md:right-4">
            <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-none md:rounded-xl shadow-lg px-4 md:px-2 max-w-6xl mx-auto md:mx-auto h-16 md:h-20 flex items-center">
              <div className="flex items-center justify-between w-full relative">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/logo/shyhy-logo-white.png" alt="SKYHY" width={200} height={68} className="h-10 md:h-14 w-auto" />
                </Link>
                
                {/* Desktop Navigation - Centered */}
                <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
                  <button 
                    onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} 
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} 
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    About
                  </button>
                  <Link 
                    href="/packages-menu"
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    Packages & Menu
                  </Link>
                  <Link 
                    href="/reserve"
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    Reserve
                  </Link>
                </nav>

                {/* Mobile Hamburger Menu */}
                <button 
                  className="md:hidden text-white p-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
      <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-0 right-0 z-40 md:hidden md:top-20 md:left-4 md:right-4"
            >
              <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-xl shadow-lg p-4 max-w-6xl mx-auto">
                <nav className="flex flex-col items-center space-y-4">
                    <button 
                      onClick={() => { 
                        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); 
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => { 
                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); 
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
                      Packages & Menu
                    </Link>
                    <Link 
                      href="/reserve"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
                    >
                      Reserve
                    </Link>
                </nav>
              </div>
            </motion.div>
          )}
          
          {/* Hero Section - Below Navbar, Vercel Blob Video */}
          <div
            id="home"
            className="relative z-10 w-full pt-16 md:pt-20 px-2 md:px-4"
          >
            <div
              className={`
                relative w-full overflow-hidden rounded-2xl md:rounded-3xl
                h-[70vh] min-h-[520px] md:h-[75vh]
              `}
            >
              {heroVideoError ? (
                /* Gradient fallback if video fails to load */
                <div
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900"
                  aria-hidden
                />
              ) : (
                <video
                  className="block w-full h-full object-cover motion-reduce:hidden"
                  style={{ filter: "brightness(0.8)", objectPosition: "center center" }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() => setHeroVideoError(true)}
                  src={HERO_VIDEO_URL}
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Subtle dark overlay for readability */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            </div>
          </div>

          {/* Live Band Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="py-16 md:py-20 px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="rounded-3xl p-8 md:p-12"
              >
                {/* Music Icon */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#B6FF00] to-[#9AE6B4] rounded-full shadow-lg">
                    <svg className="w-10 h-10 md:w-12 md:h-12 text-[#1E40AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                </motion.div>

                {/* Main Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-3xl md:text-5xl font-[family-name:var(--font-inter)] font-black text-white mb-5 leading-tight"
                >
                  Live Band <span className="text-[#B6FF00]">Every Day</span>
                </motion.h2>

                {/* Subheading */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-xl md:text-2xl text-white/90 font-[family-name:var(--font-inter)] font-semibold mb-8"
                >
                  An Unforgettable Musical Experience Awaits
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-base md:text-lg text-white/80 font-[family-name:var(--font-inter)] mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  Immerse yourself in the electrifying energy of live performances every single day. Our world-class musicians create an extraordinary atmosphere that transforms every moment into a memorable celebration.
                </motion.p>

                {/* Instagram CTA */}
                <motion.a
                  href="https://www.instagram.com/skyhylive?utm_source=ig_web_button_share_sheet&igsh=MW0zZGtreHRnMHh2ag=="
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#E4405F] to-[#C13584] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-[family-name:var(--font-inter)] font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/20"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Check Instagram to Know More</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.a>
              </motion.div>
            </div>
          </motion.div>

          {/* About Section */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            id="about"
            className="py-20 px-4"
          >
            
            <div className="relative max-w-7xl mx-auto">
              {/* Eat and Drink Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center max-w-4xl mx-auto mb-20"
              >
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-[family-name:var(--font-inter)] font-black text-white leading-tight mb-4 whitespace-nowrap"
                >
                  EAT AND DRINK ANYTHING <span className="text-[#2563EB]">@₹128</span>
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.15 }}
                  className="text-xl md:text-2xl lg:text-3xl text-white/90 font-[family-name:var(--font-inter)] font-semibold mb-6"
                >
                  FROM 12PM - 8PM
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-lg md:text-xl lg:text-2xl text-white/80 font-[family-name:var(--font-inter)] font-medium mb-8 leading-relaxed max-w-2xl mx-auto"
                >
                  Choose anything from this menu and eat @₹128 each item
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  <Link href="/menu">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-[family-name:var(--font-inter)] font-bold px-8 py-4 md:px-10 md:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg md:text-xl"
                    >
                      View Now
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>

            </div>
      </motion.div>


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
              <div className="flex justify-center mb-12">
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

              {/* View Menu Button */}
              <div className="text-center mt-8 relative z-10">
                <Link 
                  href="/menu" 
                  className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2 relative z-20 pointer-events-auto cursor-pointer"
                  style={{ zIndex: 20 }}
                >
                  <span>🍽️</span>
                  View Complete Menu
                </Link>
              </div>
            </div>
        </motion.div>
        
          {/* Section 4: Party Packages Section */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            id="packages"
            className="py-20 px-4"
          >
            <div className="max-w-7xl mx-auto">
              {/* Packages Header */}
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-white leading-tight mb-6"
                >
                  Party <span className="text-[#2563EB]">Packages</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="text-xl md:text-2xl text-white/80 font-[family-name:var(--font-inter)] font-medium"
                >
                  Choose your perfect celebration package
          </motion.p>
              </div>

              {/* Packages Grid */}
              <PackagesGrid />
            </div>
        </motion.div>

          {/* Section 5: Reserve Table CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            id="booking"
            className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] py-20 px-4"
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-white leading-tight mb-6"
              >
                Reserve Your <span className="text-[#B6FF00]">Table</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="text-xl md:text-2xl text-white/90 font-[family-name:var(--font-inter)] font-medium mb-10"
              >
                Choose a time, add guests, and confirm your booking
              </motion.p>
              <Link href="/reserve">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-[family-name:var(--font-inter)] font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl hover:shadow-[#B6FF00]/25 transition-all duration-300"
                >
                  Reserve a Table
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />

    </div>
  );
}