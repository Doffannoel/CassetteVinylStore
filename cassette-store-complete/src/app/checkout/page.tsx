'use client';

import { useAuth } from '@/contexts/AuthContext';
import useCartStore from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { items, getTotalAmount, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

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
    try {
      setIsProcessing(true);
      toast.loading('Memproses pesanan...');

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          total: totalPrice,
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
          router.push('/success');
        },
        onPending: () => {
          router.push('/success');
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

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-heading mb-8 text-center md:text-left">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Daftar Produk */}
        <div className="md:col-span-2 space-y-4">
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

        {/* Ringkasan Pembayaran */}
        <div className="border rounded-lg p-6 bg-gray-50 shadow-sm">
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

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="btn-primary w-full mt-6 py-3 rounded-md disabled:opacity-60"
          >
            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}