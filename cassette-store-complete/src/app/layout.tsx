import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hysteria Music - Vinyl, CD & Cassette Shop',
  description: 'Toko musik terlengkap untuk vinyl, CD, dan kaset',
  keywords: 'vinyl, CD, cassette, kaset, musik, toko musik',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <Script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#F7F4EE',
            },
            success: {
              iconTheme: {
                primary: '#B89C4D',
                secondary: '#F7F4EE',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
