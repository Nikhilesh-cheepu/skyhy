'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ReservationPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden w-full max-w-full">
      {/* Navigation Header - Same as Home Page */}
      <div className="fixed top-0 left-0 right-0 z-50 md:top-4 md:left-4 md:right-4">
        <div className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] rounded-none md:rounded-xl shadow-lg px-4 md:px-2 max-w-6xl mx-auto md:mx-auto h-16 md:h-20 flex items-center">
          <div className="flex items-center justify-between w-full relative">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo/shyhy-logo-white.png" alt="SKYHY" width={200} height={68} className="h-10 md:h-14 w-auto" />
            </Link>
            
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                href="/"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                Home
              </Link>
              <Link 
                href="/#about"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                About
              </Link>
              <Link 
                href="/packages-menu"
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300"
              >
                Packages & Menu
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
              <Link 
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Home
              </Link>
              <Link 
                href="/#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                About
              </Link>
              <Link 
                href="/packages-menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Packages & Menu
              </Link>
              <Link 
                href="/reservation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-[family-name:var(--font-inter)] font-semibold text-sm hover:text-[#B6FF00] transition-all duration-300 py-2 text-center"
              >
                Reservation
              </Link>
            </nav>
          </div>
        </motion.div>
      )}

      {/* Add top padding to account for fixed navbar */}
      <div className="pt-20 md:pt-24">

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 w-full">
        {/* Page Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Make a <span className="text-[#B6FF00]">Reservation</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
          >
            Reserve your spot for an unforgettable night at SKYHY Live
          </motion.p>
        </div>

        {/* Booking Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 md:p-12 border border-white/20 mb-12 w-full"
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
            
            const message = `Hi! I want to make a reservation at SKYHY Live%0A%0AName: ${name}%0ANumber of People: ${people}%0AMobile: ${mobile}%0ADate: ${formattedDate}%0ATime: ${timeText}%0A%0APlease confirm availability. Thanks!`;
            
            window.open(`https://wa.me/7013884485?text=${message}`, '_blank');
          }} className="space-y-8">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white font-semibold text-lg mb-3">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* Number of People Field */}
            <div>
              <label htmlFor="people" className="block text-white font-semibold text-lg mb-3">
                Number of People *
              </label>
              <input
                type="number"
                id="people"
                name="people"
                required
                min="1"
                max="50"
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300"
                placeholder="Enter number of people"
              />
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobile" className="block text-white font-semibold text-lg mb-3">
                Mobile Number *
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                required
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/70 text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300"
                placeholder="Enter your mobile number"
              />
            </div>

            {/* Date and Time Fields - Side by Side on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Date Field */}
              <div>
                <label htmlFor="date" className="block text-white font-semibold text-lg mb-3">
                  Preferred Date * <span className="text-sm font-normal text-white/70">(Required)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 md:px-6 py-3 md:py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white text-sm md:text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300 [color-scheme:dark] pr-10 md:pr-12"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                  <span className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none text-sm md:text-base">
                    📅
                  </span>
                </div>
              </div>

              {/* Preferred Time Field */}
              <div>
                <label htmlFor="time" className="block text-white font-semibold text-lg mb-3">
                  Preferred Time <span className="text-sm font-normal text-white/70">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="time"
                    name="time"
                    className="w-full px-3 md:px-6 py-3 md:py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white text-sm md:text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300 [color-scheme:dark] pr-10 md:pr-12"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                  <span className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none text-sm md:text-base">
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
                className="bg-gradient-to-r from-[#B6FF00] to-[#9AE6B4] text-[#1E40AF] font-bold text-xl px-12 py-4 rounded-2xl shadow-2xl hover:shadow-[#B6FF00]/25 transition-all duration-300 flex items-center gap-3 mx-auto"
              >
                <span>📱</span>
                Book Reservation via WhatsApp
              </motion.button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-white/80 text-sm">
              <p>✨ We&apos;ll contact you within 30 minutes to confirm your reservation</p>
            </div>
          </form>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link href="/packages-menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20 flex items-center gap-2"
            >
              <span>📦</span>
              View Packages
            </motion.button>
          </Link>
          <Link href="/menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20 flex items-center gap-2"
            >
              <span>🍽️</span>
              View Menu
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20 flex items-center gap-2"
            >
              <span>🏠</span>
              Go Home
            </motion.button>
          </Link>
        </div>
      </div>

        {/* Footer Section */}
        <Footer />
      </div>
    </div>
  );
}

