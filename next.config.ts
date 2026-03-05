import type { NextConfig } from "next";

// Ensure all Node.js date operations on the server default to IST.
if (!process.env.TZ) {
  process.env.TZ = "Asia/Kolkata";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdia7zfhwb3nrsg2.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
