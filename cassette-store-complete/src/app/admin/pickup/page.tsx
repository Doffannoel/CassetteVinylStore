'use client';

import { useState } from 'react';
import { Search, CheckCircle, Package, User, Calendar, Hash, AlertCircle } from 'lucide-react';
import { Order, Product } from '@/types';
import { formatCurrency, formatOrderDate } from '@/utils/whatsapp';
import toast from 'react-hot-toast';

export default function PickupVerificationPage() {
  const [searchCode, setSearchCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchCode || searchCode.length < 6) {
      toast.error('Masukkan kode pickup 6 digit');
      return;
    }

    setLoading(true);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/search?pickupCode=${searchCode}`);
      const data = await response.json();

      if (data.success && data.data) {
        setOrder(data.data);

        // Check order status
        if (data.data.pickupStatus === 'picked_up') {
          toast.error('Barang sudah diambil sebelumnya!', { duration: 5000 });
        } else if (data.data.status === 'paid' || data.data.status === 'ready_pickup') {
          toast.success('Order ditemukan! Siap untuk pickup.');
        } else if (data.data.status === 'pending') {
          toast.error('Pembayaran belum selesai');
        }
      } else {
        toast.error('Kode pickup tidak ditemukan');
      }
    } catch (error) {
      console.error('Error searching order:', error);
      toast.error('Gagal mencari order');
    } finally {
      setLoading(false);
    }
  };

  const handlePickupConfirm = async () => {
    if (!order || !order._id) return;

    if (order.pickupStatus === 'picked_up') {
      toast.error('Barang sudah diambil sebelumnya!');
      return;
    }

    if (order.status !== 'paid' && order.status !== 'ready_pickup') {
      toast.error('Order belum siap untuk pickup');
      return;
    }

    const pickedUpBy = prompt('Nama penerima (sesuai KTP):');
    if (!pickedUpBy) return;

    setVerifying(true);

    try {
      const response = await fetch(`/api/orders/${order._id}/pickup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminPassword')}`,
        },
        body: JSON.stringify({
          pickupStatus: 'picked_up',
          pickedUpBy,
          pickedUpAt: new Date(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Pickup berhasil dikonfirmasi!');
        setOrder({ ...order, pickupStatus: 'picked_up', pickedUpBy, pickedUpAt: new Date() });

        // Clear search
        setTimeout(() => {
          setSearchCode('');
          setOrder(null);
        }, 3000);
      } else {
        toast.error(data.error || 'Gagal konfirmasi pickup');
      }
    } catch (error) {
      console.error('Error confirming pickup:', error);
      toast.error('Gagal konfirmasi pickup');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'ready_pickup':
        return 'bg-green-100 text-green-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-heading mb-8 text-center">Verifikasi Pickup Barang</h1>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode pickup 6 digit"
              className="input-field text-center text-2xl font-mono tracking-wider uppercase"
              maxLength={6}
              pattern="[0-9A-Z]{6}"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Mencari...' : 'Cari Order'}
          </button>
        </form>
      </div>

      {/* Order Details */}
      {order && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div
            className={`p-4 ${
              order.pickupStatus === 'picked_up'
                ? 'bg-blue-500 text-white'
                : order.status === 'paid' || order.status === 'ready_pickup'
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {order.pickupStatus === 'picked_up' ? (
                  <>
                    <CheckCircle size={24} />
                    <span className="text-lg font-semibold">BARANG SUDAH DIAMBIL</span>
                  </>
                ) : order.status === 'paid' || order.status === 'ready_pickup' ? (
                  <>
                    <Package size={24} />
                    <span className="text-lg font-semibold">SIAP UNTUK PICKUP</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} />
                    <span className="text-lg font-semibold">PEMBAYARAN PENDING</span>
                  </>
                )}
              </div>
              <div className="text-2xl font-mono font-bold">{order.pickupCode}</div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Hash size={20} />
                  Informasi Order
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-body">Order ID:</span>
                    <span className="font-medium">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body">Tanggal:</span>
                    <span className="font-medium">
                      {order.createdAt && formatOrderDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body">Total:</span>
                    <span className="font-bold text-accent-gold">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body">Status:</span>
                    <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User size={20} />
                  Data Customer
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-body">Nama:</span>
                    <span className="font-medium">{order.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body">Phone:</span>
                    <span className="font-medium">{order.customerInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body">Email:</span>
                    <span className="font-medium text-xs">{order.customerInfo.email}</span>
                  </div>
                  {order.pickupStatus === 'picked_up' && order.pickedUpBy && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-text-body">Diambil oleh:</span>
                        <span className="font-medium">{order.pickedUpBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-body">Waktu pickup:</span>
                        <span className="font-medium">
                          {order.pickedUpAt && formatOrderDate(order.pickedUpAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package size={20} />
                Item yang Dibeli
              </h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{(item.product as Product).name || 'Product'}</p>
                      <p className="text-sm text-text-body">
                        {item.category} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {order.pickupStatus !== 'picked_up' &&
              (order.status === 'paid' || order.status === 'ready_pickup') && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handlePickupConfirm}
                    disabled={verifying}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    {verifying ? 'Memproses...' : 'Konfirmasi Pickup'}
                  </button>
                  <button
                    onClick={() => {
                      setSearchCode('');
                      setOrder(null);
                    }}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                </div>
              )}

            {order.pickupStatus === 'picked_up' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-semibold flex items-center gap-2">
                  <CheckCircle size={20} />
                  Barang sudah diambil oleh {order.pickedUpBy} pada{' '}
                  {order.pickedUpAt && formatOrderDate(order.pickedUpAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">📋 Prosedur Verifikasi Pickup:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-text-body">
          <li>Minta customer menunjukkan kode pickup atau bukti pembayaran WhatsApp</li>
          <li>Masukkan kode pickup 6 digit ke form di atas</li>
          <li>Verifikasi nama customer sesuai dengan data order</li>
          <li>Minta customer menunjukkan KTP/identitas</li>
          <li>Siapkan barang sesuai list yang tertera</li>
          <li>Klik "Konfirmasi Pickup" dan masukkan nama penerima sesuai KTP</li>
          <li>Serahkan barang kepada customer</li>
        </ol>
      </div>
    </div>
  );
}
