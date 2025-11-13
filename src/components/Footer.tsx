"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Instagram Link */}
          <motion.a
            href="https://www.instagram.com/skyhylive?utm_source=ig_web_button_share_sheet&igsh=MW0zZGtreHRnMHh2ag=="
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            aria-label="Follow us on Instagram"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
              📸
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-inter)] font-bold text-lg mb-1">Instagram</h3>
              <p className="text-white/80 font-[family-name:var(--font-inter)] text-sm">@skyhylive</p>
            </div>
          </motion.a>

          {/* WhatsApp Link */}
          <motion.a
            href="https://wa.me/7013884485"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            aria-label="Chat with us on WhatsApp"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
              💬
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-inter)] font-bold text-lg mb-1">WhatsApp</h3>
              <p className="text-white/80 font-[family-name:var(--font-inter)] text-sm">+91 7013884485</p>
            </div>
          </motion.a>

          {/* Google Maps Link */}
          <motion.a
            href="https://maps.app.goo.gl/8izvX92jtyZyJnUV9?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            aria-label="Find us on Google Maps"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
              📍
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-inter)] font-bold text-lg mb-1">Location</h3>
              <p className="text-white/80 font-[family-name:var(--font-inter)] text-sm">Gachibowli, Hyderabad</p>
            </div>
          </motion.a>

        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-white/80 font-[family-name:var(--font-inter)] text-sm">
            © 2024 SKYHY Live. All rights reserved. | Where every night tells a story.
          </p>
        </div>
      </div>
    </footer>
  );
}



