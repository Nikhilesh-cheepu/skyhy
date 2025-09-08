import type { Metadata } from 'next';
import { playfair, manrope } from '@/styles/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHYHY Live — Rooftop • Bar • Live Bands',
  description: 'SHYHY Live — an open-rooftop bar & kitchen with live bands, city skyline views, cocktails, and comfort food.',
  keywords: ['rooftop bar', 'live music', 'cocktails', 'restaurant', 'nightlife'],
  authors: [{ name: 'SHYHY Live' }],
  openGraph: {
    title: 'SHYHY Live — Rooftop • Bar • Live Bands',
    description: 'Feel the Sky, Live the Music',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHYHY Live — Rooftop • Bar • Live Bands',
    description: 'Feel the Sky, Live the Music',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`}>
      <body className={`${manrope.className} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  );
}
