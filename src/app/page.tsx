'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [currentTagline, setCurrentTagline] = useState(0);
  
  const taglines = [
    'Feel the Sky, Live the Music',
    'Where the City Meets the Stars',
    'Live Bands • Rooftop Vibes • Signature Cocktails',
    'Elevate Your Night, Embrace the Skyline'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [taglines.length]);

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#0C1222' }}>
      {/* Animated Background Gradients */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Base gradient */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'radial-gradient(ellipse at center, rgba(106, 76, 255, 0.1) 0%, rgba(12, 18, 34, 0.8) 50%, #0C1222 100%)' 
          }} 
        />
        
        {/* Large moving gradient orbs */}
        <motion.div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ 
            background: 'radial-gradient(circle, rgba(106, 76, 255, 0.3) 0%, transparent 70%)',
            top: '20%',
            right: '20%'
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(62, 224, 224, 0.2) 0%, transparent 70%)',
            bottom: '30%',
            left: '20%'
          }}
          animate={{
            x: [0, -40, 60, 0],
            y: [0, 50, -20, 0],
            scale: [1, 0.8, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Twinkling Stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.6), 0 0 12px rgba(106, 76, 255, 0.3)',
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content - Perfectly Centered */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Image
            src="/logo/shyhy-logo-white.png"
            alt="SHYHY Live Logo"
            width={400}
            height={200}
            className="w-64 md:w-80 lg:w-96 h-auto object-contain drop-shadow-2xl mx-auto"
            priority
          />
        </motion.div>
        
        {/* Rotating Tagline - Fixed Height Container */}
        <motion.div 
          className="h-16 md:h-20 flex items-center justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <motion.p 
            key={currentTagline}
            className="text-lg md:text-xl lg:text-2xl font-manrope italic"
            style={{ 
              color: 'rgba(231, 236, 242, 0.9)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {taglines[currentTagline]}
          </motion.p>
        </motion.div>

        {/* Maintenance Status Pill */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div 
            className="inline-flex items-center px-6 py-3 rounded-full backdrop-blur-sm border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}
          >
            <motion.div 
              className="w-2 h-2 rounded-full mr-3"
              style={{ backgroundColor: '#D4AF37' }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <p 
              className="text-sm md:text-base font-manrope"
              style={{ color: 'rgba(231, 236, 242, 0.8)' }}
            >
              Website under maintenance • Stay tuned for something amazing
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}