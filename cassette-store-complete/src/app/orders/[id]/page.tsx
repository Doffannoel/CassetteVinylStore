'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IOrder } from '@/models/Order';
import toast from 'react-hot-toast';

type OrderData = IOrder & {
  items: {
    product: {
      _id: string;
      name: string;
      artist: string;
      images: string[]; // Changed from image to images
    };
    quantity: number;
    price: number;
  }[];
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';

    let script: HTMLScriptElement | null = document.querySelector(
      `script[src="${midtransScriptUrl}"]`
    );

    if (!script) {
      script = document.createElement('script');
      script.src = midtransScriptUrl;
      script.setAttribute(
        'data-client-key',
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
      );
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      if (script && script.parentNode) {
        // Clean up script when component unmounts
        // script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleRetryPayment = async () => {
    if (!order) return;

    setIsPaying(true);
    try {
      const res = await fetch(`/api/orders/${id}/retry-payment`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mencoba ulang pembayaran.');
      }

      const { token } = data;

      (window as any).snap.pay(token, {
        onSuccess: function (result: any) {
          toast.success('Pembayaran berhasil!');
          router.push(`/payment/success?order_id=${order.orderId}`);
        },
        onPending: function (result: any) {
          toast('Menunggu pembayaran Anda.');
          router.refresh();
        },
        onError: function (result: any) {
          toast.error('Pembayaran gagal.');
        },
        onClose: function () {
          toast('Anda menutup popup tanpa menyelesaikan pembayaran.');
        },
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/orders/${id}`);
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Gagal memuat pesanan');
          }

          setOrder(data.data);
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id]);

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'ready_for_pickup':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
          <p>Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link href="/products" className="btn-primary px-6 py-3 rounded-md">
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-8">
          Pesanan yang Anda cari tidak ada atau telah dihapus.
        </p>
        <Link href="/products" className="btn-primary px-6 py-3 rounded-md">
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading">Detail Pesanan</h1>
              <p className="text-gray-500 font-mono">{order.orderId}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipColor(
                  order.status
                )}`}
              >
                Status: {order.status}
              </span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChipColor(
                  order.paymentStatus ?? ''
                )}`}
              >
                Pembayaran: {order.paymentStatus}
              </span>
            </div>
          </div>

          {order.paymentStatus === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
              <h3 className="font-bold text-yellow-800">Menunggu Pembayaran</h3>
              <p className="text-sm text-yellow-700">
                Selesaikan pembayaran Anda. Jika Anda sudah membayar, mohon tunggu beberapa saat hingga status diperbarui.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Informasi Pelanggan</h3>
              <p className="text-gray-600">
                <strong>Nama:</strong> {order.customerInfo.name}
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> {order.customerInfo.email}
              </p>
              <p className="text-gray-600">
                <strong>Telepon:</strong> {order.customerInfo.phone}
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Ringkasan Pembayaran</h3>
              <p className="text-gray-600">
                <strong>Metode Pembayaran:</strong> {order.paymentMethod || 'Belum Dipilih'}
              </p>
              <p className="text-gray-600">
                <strong>Total Pesanan:</strong>
                <span className="font-bold text-accent-gold ml-2">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Barang Pesanan</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.product._id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.images?.[0] || '/images/placeholder.png'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-gray-500">{item.product.artist}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center items-center gap-4">
          <Link href="/products" className="text-accent-gold hover:underline">
            &larr; Lanjut Belanja
          </Link>
          {order.status === 'pending' && (
            <button
              onClick={handleRetryPayment}
              disabled={isPaying}
              className="btn-primary px-6 py-3 rounded-md disabled:bg-gray-400"
            >
              {isPaying ? 'Memproses...' : 'Coba Bayar Lagi'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
