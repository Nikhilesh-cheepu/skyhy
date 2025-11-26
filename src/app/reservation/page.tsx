'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ReservationPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white py-4 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                <Image 
                  src="/logo/shyhy-logo-white.png" 
                  alt="SKYHY Live Logo" 
                  width={60} 
                  height={60}
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Navigation Links - Center */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                href="/" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Home
              </Link>
              <Link 
                href="/#about" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                About
              </Link>
              <Link 
                href="/menu" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Menu
              </Link>
              <Link 
                href="/packages-menu" 
                className="text-white/90 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Packages & Menu
              </Link>
            </nav>

            {/* Book Table Button - Right */}
            <Link
              href="/reservation"
              className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-3 hover:bg-white/25 transition-all duration-300 border border-white/20 hover:scale-105 bg-white/20"
            >
              <span className="text-sm font-medium">Reservation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
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
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 mb-12"
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
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300 [color-scheme:dark]"
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
                <label htmlFor="time" className="block text-white font-semibold text-lg mb-3">
                  Preferred Time <span className="text-sm font-normal text-white/70">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="time"
                    name="time"
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#B6FF00] focus:border-transparent transition-all duration-300 [color-scheme:dark]"
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
  );
}

