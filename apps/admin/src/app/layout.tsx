import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalEdge Admin',
  description: 'LocalEdge Super Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
