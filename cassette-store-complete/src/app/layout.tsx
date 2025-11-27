import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
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
      </head>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
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
        </AuthProvider>

      </body>
    </html>
  );
}
