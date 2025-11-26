"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import PackagesGrid from "@/components/PackagesGrid";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black relative scroll-smooth">
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
          <div className="fixed top-4 left-4 right-4 z-50">
            <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-xl shadow-lg p-2 max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/logo/shyhy-logo-white.png" alt="SKYHY" width={200} height={68} className="h-14 w-auto" />
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 mx-auto">
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
                </nav>
                
                {/* Reservation Button - Rightmost (Desktop Only) */}
                <Link 
                  href="/reservation"
                  className="hidden md:block bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-[family-name:var(--font-inter)] font-bold px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Reservation
                </Link>

                {/* Mobile Reservation Button & Hamburger Menu */}
                <div className="md:hidden flex items-center gap-2">
                  <Link 
                    href="/reservation"
                    className="bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-bold px-3 py-1.5 rounded-full text-xs hover:shadow-lg transition-all duration-300"
                  >
                    Reservation
                  </Link>
                  <button 
                    className="text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
      <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-4 right-4 z-40 md:hidden"
            >
              <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-xl shadow-lg p-4 max-w-6xl mx-auto">
                <nav className="flex flex-col space-y-4">
                    <button 
                      onClick={() => { 
                        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); 
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => { 
                        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); 
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2"
                    >
                      About
                    </button>
                    <Link 
                      href="/packages-menu"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2"
                    >
                      Packages & Menu
                    </Link>
                    <Link 
                      href="/reservation"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2"
                    >
                      Reservation
                    </Link>
                </nav>
              </div>
            </motion.div>
          )}
          
          {/* Hero Section - Full Viewport */}
          <div id="home" className="relative z-10 w-full h-screen">
            {/* Video Container - Full Screen */}
            <div className="relative w-full h-full overflow-hidden">
              {/* Mobile Video (Portrait 9:16) - Full Screen */}
              <video
                className="block md:hidden w-full h-full object-cover motion-reduce:hidden"
                style={{ filter: 'brightness(0.8)', objectPosition: 'center center' }}
                autoPlay
                loop
                muted
                playsInline
                poster="/api/placeholder/400/700"
              >
                <source src="/hero videos/hero-portrait.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Desktop Video (Landscape 16:9) */}
              <video
                className="hidden md:block w-full h-full object-cover motion-reduce:hidden"
                style={{ filter: 'brightness(0.8)' }}
                autoPlay
                loop
                muted
                playsInline
                poster="/api/placeholder/1200/675"
              >
                <source src="/hero videos/hero-landscape.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Fallback Images for Reduced Motion */}
              <div className="motion-reduce:block hidden w-full h-full">
                <Image 
                  src="/api/placeholder/400/700" 
                  alt="SKYHY Live Hero" 
                  width={400}
                  height={700}
                  className="block md:hidden w-full h-full object-cover"
                />
                <Image 
                  src="/api/placeholder/1200/675" 
                  alt="SKYHY Live Hero" 
                  width={1200}
                  height={675}
                  className="hidden md:block w-full h-full object-cover"
                />
              </div>

              {/* Clean Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>

            </div>
      </div>

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
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <div 
                    key={item} 
                    className="relative w-24 h-32 md:w-28 md:h-40 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                    style={{
                      transform: `rotate(${(index - 2) * 3}deg) translateY(${Math.abs(index - 2) * 2}px)`,
                      zIndex: 5 - Math.abs(index - 2),
                      marginLeft: index > 0 ? '-8px' : '0'
                    }}
                  >
                    <div className="w-16 h-20 md:w-20 md:h-24 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Image 
                        src={`/api/placeholder/80/100`} 
                        alt={`Food ${item}`} 
                        width={80}
                        height={100}
                        className="w-full h-full object-cover rounded-lg"
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

          {/* Section 5: Book Table Section */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            id="booking"
            className="bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] py-20 px-4"
          >
            <div className="max-w-4xl mx-auto">
              {/* Booking Header */}
              <div className="text-center mb-16">
                <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-white leading-tight mb-6"
                >
                  Book Your <span className="text-[#B6FF00]">Table</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="text-xl md:text-2xl text-white/90 font-[family-name:var(--font-inter)] font-medium"
                >
                  Reserve your spot for an unforgettable night
                </motion.p>
              </div>

              {/* Booking Form */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20"
              >
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const name = formData.get('name') as string;
                  const people = formData.get('people') as string;
                  const mobile = formData.get('mobile') as string;
                  const date = formData.get('date') as string;
                  const time = formData.get('time') as string;
                  
                  // Format date nicely
                  const dateObj = new Date(date);
                  const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                  
                  // Format time nicely if provided
                  let timeText = 'Not specified';
                  if (time) {
                    const [hours, minutes] = time.split(':');
                    const hour12 = parseInt(hours) % 12 || 12;
                    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
                    timeText = `${hour12}:${minutes} ${ampm}`;
                  }
                  
                  const message = `Hi! I want to book a table at SKYHY Live%0A%0AName: ${name}%0APeople: ${people}%0AMobile: ${mobile}%0ADate: ${formattedDate}%0ATime: ${timeText}%0A%0APlease confirm availability. Thanks!`;
                  
                  window.open(`https://wa.me/7013884485?text=${message}`, '_blank');
                }} className="space-y-8">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-white font-[family-name:var(--font-inter)] font-semibold text-lg mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 font-[family-name:var(--font-inter)] text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Number of People Field */}
                  <div>
                    <label htmlFor="people" className="block text-white font-[family-name:var(--font-inter)] font-semibold text-lg mb-3">
                      Number of People *
                    </label>
                    <input
                      type="number"
                      id="people"
                      name="people"
                      required
                      min="1"
                      max="50"
                      className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 font-[family-name:var(--font-inter)] text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300"
                      placeholder="Enter number of people"
                    />
                  </div>

                  {/* Mobile Number Field */}
                  <div>
                    <label htmlFor="mobile" className="block text-white font-[family-name:var(--font-inter)] font-semibold text-lg mb-3">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      required
                      className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 font-[family-name:var(--font-inter)] text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  {/* Date and Time Fields - Side by Side on Desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preferred Date Field */}
                    <div>
                      <label htmlFor="date" className="block text-white font-[family-name:var(--font-inter)] font-semibold text-lg mb-3">
                        Preferred Date * <span className="text-sm font-normal text-white/70">(Required)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="date"
                          name="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-[family-name:var(--font-inter)] text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300 [color-scheme:dark]"
                          style={{
                            colorScheme: 'dark'
                          }}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
                          📅
                        </span>
                      </div>
                    </div>

                    {/* Preferred Time Field */}
                    <div>
                      <label htmlFor="time" className="block text-white font-[family-name:var(--font-inter)] font-semibold text-lg mb-3">
                        Preferred Time <span className="text-sm font-normal text-white/70">(Optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          id="time"
                          name="time"
                          className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white font-[family-name:var(--font-inter)] text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300 [color-scheme:dark]"
                          style={{
                            colorScheme: 'dark'
                          }}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
                          🕐
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-4">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-[family-name:var(--font-inter)] font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl hover:shadow-[#B6FF00]/25 transition-all duration-300 flex items-center gap-3 mx-auto"
                    >
                      <span>📱</span>
                      Book Table via WhatsApp
                    </motion.button>
                  </div>

                  {/* Additional Info */}
                  <div className="text-center text-white/80 font-[family-name:var(--font-inter)] text-sm">
                    <p>✨ We&apos;ll contact you within 30 minutes to confirm your reservation</p>
                  </div>
                </form>
              </motion.div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />

    </div>
  );
}