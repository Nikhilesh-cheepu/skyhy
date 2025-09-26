import type { Metadata } from "next";
import { playfair, manrope, inter } from '@/styles/fonts';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://skyhy.vercel.app'),
  title: 'SHYHY Live',
  description: 'Feel the Sky, Live the Music.',
  keywords: ['rooftop bar', 'live music', 'cocktails', 'restaurant', 'nightlife'],
  authors: [{ name: 'SHYHY Live' }],
  openGraph: {
    title: 'SHYHY Live',
    description: 'Feel the Sky, Live the Music',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/logo/shyhy-logo-white.png',
        width: 400,
        height: 200,
        alt: 'SHYHY Live Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHYHY Live',
    description: 'Feel the Sky, Live the Music',
    images: ['/logo/shyhy-logo-white.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${manrope.variable} ${inter.variable}`}>
      <body className={`${manrope.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}