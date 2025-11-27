'use client';

import { useAuth } from '@/contexts/AuthContext';
import useCartStore from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const midtransScriptUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';

    let script = document.querySelector<HTMLScriptElement>(`script[src="${midtransScriptUrl}"]`);

    if (!script) {
      script = document.createElement('script');
      script.src = midtransScriptUrl;
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      // Optional: Cleanup script when component unmounts
      // if (script && script.parentNode) {
      //   script.parentNode.removeChild(script);
      // }
    };
  }, []);


  const totalPrice = getTotalAmount();

  // ❌ HAPUS INI - Middleware sudah handle
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push(`/login?redirect=/checkout`);
  //   }
  // }, [user, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!items.length) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-heading mb-3">Keranjang Kosong</h1>
        <p className="text-gray-600 mb-8">Tambahkan produk ke keranjang terlebih dahulu.</p>
        <button
          onClick={() => router.push('/products')}
          className="btn-primary inline-block px-6 py-3 rounded-md"
        >
          Lanjut Belanja
        </button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!phone) {
      toast.error('Harap isi nomor telepon.');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Memproses pesanan...');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          customerInfo: {
            name: user?.name,
            email: user?.email,
            phone,
          },
        }),
      });

      toast.dismiss();
      const data = await res.json();

      if (!res.ok || !data?.snapToken) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      // Panggil Midtrans Snap popup
      (window as any).snap?.pay(data.snapToken, {
        onSuccess: () => {
          clearCart();
          router.push(`/orders/${data.data.orderId}`);
        },
        onPending: () => {
          router.push(`/orders/${data.data.orderId}`);
        },
        onError: () => toast.error('Pembayaran gagal.'),
        onClose: () => toast('Pembayaran dibatalkan.'),
      });
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayAtStore = async () => {
    if (!phone) {
      toast.error('Harap isi nomor telepon.');
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading('Memproses pesanan...');

      const res = await fetch('/api/orders/pay-at-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
          customerInfo: {
            name: user?.name,
            email: user?.email,
            phone,
          },
        }),
      });

      toast.dismiss();
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      clearCart();
      router.push(`/orders/${data.data.orderId}`);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Terjadi kesalahan saat checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-heading mb-8 text-center md:text-left">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Daftar Produk */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="flex justify-between items-center border-b border-gray-200 pb-3"
              >
                <div>
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.quantity} x Rp {item.product.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <span className="font-semibold text-accent-gold">
                  Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>

          {/* Informasi Pengiriman */}
          <div className="space-y-4 border rounded-lg p-6 bg-gray-50 shadow-sm">
            <h2 className="text-xl font-heading mb-4">Informasi Pengiriman</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-gold focus:border-accent-gold sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="border rounded-lg p-6 bg-gray-50 shadow-sm h-fit">
          <h2 className="text-xl font-heading mb-4">Ringkasan Pembayaran</h2>

          <div className="flex justify-between mb-2">
            <span className="text-gray-700">Subtotal</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span className="text-gray-700">Biaya Pengiriman</span>
            <span>Rp 0</span>
          </div>

          <div className="flex justify-between text-lg font-semibold border-t pt-3">
            <span>Total</span>
            <span className="text-accent-gold">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>

          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Opsi Pembayaran</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Bayar Sekarang:</strong> Lakukan pembayaran online melalui Midtrans. Anda akan menerima bukti pembayaran via WhatsApp untuk ditunjukkan di toko.
              </p>
              <p>
                <strong>Bayar di Tempat:</strong> Pesan sekarang dan bayar tunai saat Anda mengambil barang di toko. Anda akan menerima bukti pre-order via WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="btn-primary w-full mt-6 py-3 rounded-md disabled:opacity-60"
          >
            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
          <button
            onClick={handlePayAtStore}
            disabled={isProcessing}
            className="btn-secondary w-full mt-2 py-3 rounded-md disabled:opacity-60"
          >
            {isProcessing ? 'Memproses...' : 'Bayar di Tempat'}
          </button>
        </div>
      </div>
    </div>
  );
}