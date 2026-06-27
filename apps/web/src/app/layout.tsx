import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LocalEdge - AI-Powered Business Growth',
  description: "India's AI-powered hyperlocal business growth platform",
  keywords: ['local business', 'WhatsApp marketing', 'review management', 'loyalty program', 'India'],
  themeColor: '#f97316',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'LocalEdge',
    description: "India's AI-powered hyperlocal business growth platform",
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
