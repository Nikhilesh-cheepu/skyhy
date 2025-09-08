import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0C1222",
        skyline: "#6A4CFF", 
        neon: "#3EE0E0",
        gold: "#D4AF37",
        cloud: "#E7ECF2",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        manrope: ["var(--font-manrope)", "sans-serif"],
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;