'use client';

import { useEffect, useState } from 'react';
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

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappSent, setWhatsappSent] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/search?orderId=${orderId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
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

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    setWhatsappSent(true);

    // Also send to store if configured
    if (process.env.NEXT_PUBLIC_STORE_WHATSAPP) {
      const storeMessage = generateStoreWhatsAppMessage(orderData);
      const storeWhatsappUrl = generateWhatsAppUrl(
        process.env.NEXT_PUBLIC_STORE_WHATSAPP,
        storeMessage
      );

      // Open store notification after 2 seconds
      setTimeout(() => {
        window.open(storeWhatsappUrl, '_blank');
      }, 2000);
    }

    // Update order status
    updateOrderWhatsappStatus();
  };

  const updateOrderWhatsappStatus = async () => {
    if (!order?._id) return;

    try {
      await fetch(`/api/orders/${order._id}/whatsapp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-heading mb-2">Pembayaran Berhasil!</h1>
          <p className="text-text-body">Terima kasih telah berbelanja di Cassette Store</p>
        </div>

        {order && (
          <>
            {/* Order Details */}
            <div className="bg-neutral-card rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-text-body">Order ID</p>
                  <p className="font-semibold">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-text-body">Tanggal</p>
                  <p className="font-semibold">
                    {order.createdAt && formatOrderDate(order.createdAt)}
                  </p>
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

              {/* Pickup Code - Prominent Display */}
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
                <p className="text-sm mt-2 opacity-90">
                  Tunjukkan kode ini saat pengambilan barang
                </p>
              </div>
            </div>

            {/* WhatsApp Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <MessageCircle className="text-blue-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Kirim Bukti Pembayaran</h3>
                  <p className="text-sm text-text-body mb-4">
                    Kirim bukti pembayaran ke WhatsApp Anda untuk ditunjukkan saat pengambilan
                    barang di toko
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

            {/* Pickup Instructions */}
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

            {/* Store Location */}
            <div className="border border-neutral-divider rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3">📍 Lokasi Pengambilan</h3>
              <p className="text-text-body">
                <strong>{process.env.NEXT_PUBLIC_STORE_NAME || 'Cassette Store Jakarta'}</strong>
                <br />
                {process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Jl. Musik No. 123, Jakarta Selatan'}
                <br />
                Telp: {process.env.NEXT_PUBLIC_STORE_PHONE || '021-12345678'}
              </p>
              <p className="text-sm text-text-body mt-3">
                Jam operasional: Senin-Sabtu 10:00-21:00, Minggu 10:00-20:00
              </p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Item yang Dibeli</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b border-neutral-divider"
                  >
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
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/products')} className="btn-secondary flex-1">
            Lanjut Belanja
          </button>
          <button onClick={() => router.push('/')} className="btn-primary flex-1">
            Kembali ke Beranda
          </button>
        </div>

        {/* Additional Info */}
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
