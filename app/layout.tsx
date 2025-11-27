import './globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Forenstick',
  description: 'Cases viewer for Forenstick',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(72,149,239,0.1),transparent_45%),#030712]">
          {children}
        </div>
        <Toaster position="top-center" richColors duration={3500} />
      </body>
    </html>
  );
}
