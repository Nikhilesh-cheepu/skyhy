"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import PackagesGrid from "@/components/PackagesGrid";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white relative scroll-smooth">
      {/* Section 1: Light Background with subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      
      {/* Main container */}
      <div className="min-h-screen">
        {/* Section 2: White Container - holds navbar and content */}
        <div className="bg-white min-h-screen relative overflow-hidden">
          {/* subtle sky gradient overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            background: 'linear-gradient(90deg, #2563EB, #3B82F6)'
          }} />
          
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
                    onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' }); } 
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); } 
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    About
                  </button>
                  <button 
                    onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); } 
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    Menu
                  </button>
                  <button 
                    onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' }); } 
                    className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
                  >
                    Packages
                  </button>
                </nav>
                
                {/* Book Table Button - Rightmost (Desktop Only) */}
                <button 
                  onClick={(e) => { e.preventDefault(); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="hidden md:block bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-[family-name:var(--font-inter)] font-bold px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Book Table
                </button>

                {/* Mobile Book Table Button & Hamburger Menu */}
                <div className="md:hidden flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-bold px-3 py-1.5 rounded-full text-xs hover:shadow-lg transition-all duration-300"
                  >
                    Book Table
                  </button>
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
                    <button 
                      onClick={() => { 
                        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); 
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2"
                    >
                      Menu
                    </button>
                    <button 
                      onClick={() => { 
                        document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' }); 
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2"
                    >
                      Packages
                    </button>
                </nav>
              </div>
            </motion.div>
          )}
          
          {/* Hero content inside blue container */}
          <div id="home" className="relative z-10 w-full pt-24 px-4">
            {/* Video Container with Rounded Corners */}
            <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-3xl mx-auto shadow-2xl">
              {/* Mobile Video (Portrait 9:16) */}
              <video
                className="block md:hidden w-full h-full object-cover motion-reduce:hidden"
                style={{ filter: 'brightness(0.8)' }}
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

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40"></div>

              {/* Hero Content Overlay - Clean and Cinematic */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-12">
        <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-inter)] font-black text-white leading-tight mb-8 drop-shadow-lg">
                    WELCOME TO <span className="text-[#2563EB]">SKYHY</span> LIVE
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-[family-name:var(--font-inter)] font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                    Where every night tells a story
                  </p>
      </motion.div>
              </div>
            </div>
      </div>

          {/* Section 2: About Section - Modern Design */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            id="about"
            className="bg-white py-20 px-4"
          >
            <div className="max-w-7xl mx-auto">
              {/* About Header */}
              <div className="text-center mb-20">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-[#1E293B] leading-tight mb-6"
                >
                  About <span className="text-[#2563EB]">SKYHY</span> Live
                </motion.h2>
                <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-xl md:text-2xl text-[#64748B] font-[family-name:var(--font-inter)] font-medium"
                >
                  Where Every Night Tells a Story
                </motion.p>
              </div>

              {/* Information Cards - Responsive Layout */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-20">
                {/* Happy Hours Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl md:rounded-3xl p-4 md:p-8 text-white overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 backdrop-blur-sm mx-auto">
                      <span className="text-xl md:text-3xl">🍹</span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-[family-name:var(--font-inter)] font-bold mb-2 md:mb-3 text-center">Happy Hours</h3>
                    <p className="text-white/90 font-[family-name:var(--font-inter)] text-sm md:text-lg text-center mt-auto">Everyday 12 PM to 8 PM</p>
                  </div>
                </motion.div>

                {/* Timings Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl md:rounded-3xl p-4 md:p-8 text-white overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 backdrop-blur-sm mx-auto">
                      <span className="text-xl md:text-3xl">⏰</span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-[family-name:var(--font-inter)] font-bold mb-2 md:mb-3 text-center">Timings</h3>
                    <p className="text-white/90 font-[family-name:var(--font-inter)] text-sm md:text-lg text-center mt-auto">12 PM to 1 AM</p>
                  </div>
                </motion.div>

                {/* Locate Us Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl md:rounded-3xl p-4 md:p-8 text-white overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 backdrop-blur-sm mx-auto">
                      <span className="text-xl md:text-3xl">📍</span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-[family-name:var(--font-inter)] font-bold mb-2 md:mb-3 text-center">Locate Us</h3>
                    <p className="text-white/90 font-[family-name:var(--font-inter)] text-sm md:text-lg text-center mt-auto">Find us on the map</p>
                  </div>
        </motion.div>
        
                {/* Connect With Us Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative bg-gradient-to-br from-[#EC4899] to-[#DB2777] rounded-2xl md:rounded-3xl p-4 md:p-8 text-white overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 backdrop-blur-sm mx-auto">
                      <div className="flex gap-1 md:gap-2">
                        <span className="text-lg md:text-2xl">📸</span>
                        <span className="text-lg md:text-2xl">💬</span>
                      </div>
                    </div>
                    <h3 className="text-lg md:text-2xl font-[family-name:var(--font-inter)] font-bold mb-2 md:mb-3 text-center">Connect</h3>
                    <div className="flex flex-col gap-1 md:gap-2 mt-auto">
                      <a href="#" className="text-white/90 text-sm md:text-lg hover:text-white transition-colors text-center">Instagram</a>
                      <a href="#" className="text-white/90 text-sm md:text-lg hover:text-white transition-colors text-center">WhatsApp</a>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Our Story Section */}
        <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="text-center bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] rounded-3xl p-12"
              >
                <h3 className="text-2xl md:text-4xl font-[family-name:var(--font-inter)] font-bold text-[#1E293B] mb-6 md:mb-8">Our Story</h3>
                <p className="text-sm md:text-xl text-[#64748B] font-[family-name:var(--font-inter)] max-w-4xl mx-auto leading-relaxed text-left">
                  SKYHY Live is more than just a venue—it&apos;s a destination where nightlife meets luxury, 
                  where every moment is crafted to perfection. We believe in creating experiences that 
                  transcend the ordinary, bringing together the best of entertainment, cuisine, and ambiance 
                  under one roof.
                </p>
              </motion.div>
            </div>
          </motion.div>


          {/* Section 3: Menu Section */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            id="menu"
            className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] py-20 px-4"
          >
            <div className="max-w-7xl mx-auto">
              {/* Menu Header */}
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-[#1E293B] leading-tight mb-6"
                >
                  Our <span className="text-[#2563EB]">Menu</span>
                </motion.h2>
                <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="text-xl md:text-2xl text-[#64748B] font-[family-name:var(--font-inter)] font-medium"
                >
                  A Taste of Our Delicious Menu
                </motion.p>
              </div>

              {/* Food Images Collage - Game Card Style */}
              <div className="flex justify-center mb-12">
                {[1, 2, 3, 4, 5].map((item, index) => (
                  <div 
                    key={item} 
                    className="relative w-24 h-32 md:w-28 md:h-40 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 hover:scale-105"
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
            className="bg-white py-20 px-4"
          >
            <div className="max-w-7xl mx-auto">
              {/* Packages Header */}
              <div className="text-center mb-16">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-5xl md:text-6xl font-[family-name:var(--font-inter)] font-black text-[#1E293B] leading-tight mb-6"
                >
                  Party <span className="text-[#2563EB]">Packages</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="text-xl md:text-2xl text-[#64748B] font-[family-name:var(--font-inter)] font-medium"
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
                  
                  const message = `Hi! I want to book a table at SKYHY Live%0A%0AName: ${name}%0APeople: ${people}%0AMobile: ${mobile}%0A%0APlease confirm availability. Thanks!`;
                  
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

    </div>
  );
}