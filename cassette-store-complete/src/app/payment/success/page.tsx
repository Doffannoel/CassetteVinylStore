'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, MessageCircle, Store, Copy, Loader2 } from 'lucide-react';
import {
  generateWhatsAppMessage,
  generateWhatsAppUrl,
  generateStoreWhatsAppMessage,
  formatCurrency,
  formatOrderDate,
} from '@/utils/whatsapp';
import { Order, Product } from '@/types';
import toast from 'react-hot-toast';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappSent, setWhatsappSent] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/search?orderId=${orderId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setOrder(data.data);
        updateProductStock(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (items: any[]) => {
    try {
      const productsToUpdate = items.map((item) => ({
        productId: (item.product as Product)._id,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/products/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: productsToUpdate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update product stock:', errorData.message);
        toast.error('Gagal mengurangi stok produk.');
      } else {
        console.log('Product stock updated successfully.');
      }
    } catch (error) {
      console.error('Error updating product stock:', error);
      toast.error('Terjadi kesalahan saat mengurangi stok produk.');
    }
  };

  const handleSendWhatsApp = () => {
    if (!order) return;

    const customerPhone = order.customerInfo.phone;
    const orderData = {
      orderId: order.orderId,
      pickupCode: order.pickupCode || '000000',
      customerName: order.customerInfo.name,
      items: order.items.map((item) => ({
        name: (item.product as Product).name || 'Product',
        quantity: item.quantity,
        price: item.price,
        category: (item.product as Product).category || 'item',
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod || 'Midtrans',
      orderDate: order.createdAt || new Date(),
      storeAddress: process.env.NEXT_PUBLIC_STORE_ADDRESS,
      storePhone: process.env.NEXT_PUBLIC_STORE_PHONE,
    };

    const message = generateWhatsAppMessage(orderData);
    const whatsappUrl = generateWhatsAppUrl(customerPhone, message);

    window.open(whatsappUrl, '_blank');
    setWhatsappSent(true);

    if (process.env.NEXT_PUBLIC_STORE_WHATSAPP) {
      const storeMessage = generateStoreWhatsAppMessage(orderData);
      const storeWhatsappUrl = generateWhatsAppUrl(
        process.env.NEXT_PUBLIC_STORE_WHATSAPP,
        storeMessage
      );
      setTimeout(() => {
        window.open(storeWhatsappUrl, '_blank');
      }, 2000);
    }
    updateOrderWhatsappStatus();
  };

  const updateOrderWhatsappStatus = async () => {
    if (!order?._id) return;
    try {
      await fetch(`/api/orders/${order._id}/whatsapp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappSent: true }),
      });
    } catch (error) {
      console.error('Error updating WhatsApp status:', error);
    }
  };

  const copyPickupCode = () => {
    if (order?.pickupCode) {
      navigator.clipboard.writeText(order.pickupCode);
      toast.success('Kode pickup berhasil disalin!');
    }
  };

  const downloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        toast.error('Failed to download invoice');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully as PDF');
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12 max-w-3xl text-center">
        <h1 className="text-2xl font-heading mb-4">Order Not Found</h1>
        <p className="text-text-body mb-6">
          We couldn't find the details for this order. Please check the link or return to the
          homepage.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-heading mb-2">Pembayaran Berhasil!</h1>
          <p className="text-text-body">Terima kasih telah berbelanja di Hysteria Music</p>
        </div>

        <div className="bg-neutral-card rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-text-body">Order ID</p>
              <p className="font-semibold">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-text-body">Tanggal</p>
              <p className="font-semibold">{order.createdAt && formatOrderDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-text-body">Total Pembayaran</p>
              <p className="font-semibold text-accent-gold">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-body">Status</p>
              <span className="badge bg-green-100 text-green-800">Pembayaran Diterima</span>
            </div>
          </div>

          <div className="bg-accent-gold text-white rounded-lg p-6 text-center">
            <p className="text-sm mb-2">KODE PENGAMBILAN</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold font-mono tracking-wider">
                {order.pickupCode || '000000'}
              </span>
              <button
                onClick={copyPickupCode}
                className="p-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>
            <p className="text-sm mt-2 opacity-90">Tunjukkan kode ini saat pengambilan barang</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <MessageCircle className="text-blue-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Kirim Bukti Pembayaran</h3>
              <p className="text-sm text-text-body mb-4">
                Kirim bukti pembayaran ke WhatsApp Anda untuk ditunjukkan saat pengambilan barang di
                toko
              </p>
              {!whatsappSent ? (
                <button
                  onClick={handleSendWhatsApp}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={20} />
                  Kirim ke WhatsApp Saya
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <span>WhatsApp terkirim! Cek pesan Anda.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <Store className="text-amber-600 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Cara Pengambilan Barang</h3>
              <ol className="text-sm text-text-body space-y-2 list-decimal list-inside">
                <li>Simpan bukti pembayaran dari WhatsApp</li>
                <li>Datang ke toko dalam 1x24 jam</li>
                <li>
                  Tunjukkan bukti pembayaran atau kode: <strong>{order.pickupCode}</strong>
                </li>
                <li>Bawa KTP/identitas yang sesuai dengan nama pembeli</li>
                <li>Ambil barang Anda di counter</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="border border-neutral-divider rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">📍 Lokasi Pengambilan</h3>
          <p className="text-text-body">
            <strong>{process.env.NEXT_PUBLIC_STORE_NAME || 'Hysteria Music Jakarta'}</strong>
            <br />
            {process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Jl. Musik No. 123, Jakarta Selatan'}
            <br />
            Telp: {process.env.NEXT_PUBLIC_STORE_PHONE || '021-12345678'}
          </p>
          <p className="text-sm text-text-body mt-3">Jam operasional: Senin-Sabtu 11:00-20:00</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Item yang Dibeli</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-neutral-divider">
                <div>
                  <p className="font-medium">{(item.product as Product).name || 'Product'}</p>
                  <p className="text-sm text-text-body">
                    {(item.product as Product).category} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-neutral-divider">
            <p className="font-semibold">Total</p>
            <p className="font-semibold text-accent-gold text-lg">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => order && downloadInvoice(order._id!)}
            className="btn-secondary flex-1"
          >
            Download Invoice
          </button>
          <button onClick={() => router.push('/products')} className="btn-secondary flex-1">
            Lanjut Belanja
          </button>
          <button onClick={() => router.push('/')} className="btn-primary flex-1">
            Kembali ke Beranda
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-text-body">
          <p className="font-semibold mb-2">ℹ️ Informasi Penting:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Barang dapat diambil maksimal 1x24 jam setelah pembayaran</li>
            <li>Pastikan nomor WhatsApp Anda aktif untuk menerima bukti pembayaran</li>
            <li>
              Jika ada kendala, hubungi toko di{' '}
              {process.env.NEXT_PUBLIC_STORE_PHONE || '021-12345678'}
            </li>
            <li>Pembatalan dan refund hanya dapat dilakukan di toko fisik</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 flex justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
