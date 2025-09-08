import type { Metadata } from "next";
import { playfair, manrope } from '@/styles/fonts';
import "./globals.css";

export const metadata: Metadata = {
  title: 'SHYHY Live — Under Maintenance',
  description: 'SHYHY Live — Feel the Sky, Live the Music. Website under maintenance, stay tuned for something amazing.',
  keywords: ['rooftop bar', 'live music', 'cocktails', 'restaurant', 'nightlife', 'under maintenance', 'coming soon'],
  authors: [{ name: 'SHYHY Live' }],
  openGraph: {
    title: 'SHYHY Live — Under Maintenance',
    description: 'Feel the Sky, Live the Music • Stay tuned for something amazing',
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
    title: 'SHYHY Live — Under Maintenance',
    description: 'Feel the Sky, Live the Music • Stay tuned for something amazing',
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
    <html lang="en" className={`${playfair.variable} ${manrope.variable}`}>
      <body className={`${manrope.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}