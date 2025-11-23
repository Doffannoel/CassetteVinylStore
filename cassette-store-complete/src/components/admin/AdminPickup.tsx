'use client';

import { useState } from 'react';
import { Search, CheckCircle, Package, User, Hash, AlertCircle, DollarSign, CreditCard, X, Clipboard } from 'lucide-react';
import { Order, Product } from '@/types';
import { formatCurrency, formatOrderDate } from '@/utils/whatsapp';
import toast from 'react-hot-toast';

// Custom Modal Component
function PickupConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  customerName: string;
  isLoading: boolean;
}) {
  const [pickedUpBy, setPickedUpBy] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!pickedUpBy.trim()) {
      setError('Nama penerima harus diisi');
      return;
    }

    if (pickedUpBy.trim().length < 3) {
      setError('Nama penerima minimal 3 karakter');
      return;
    }

    onConfirm(pickedUpBy.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setPickedUpBy('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-4 border-accent-gold shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="bg-accent-gold p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clipboard size={32} className="text-white" />
            <h3 className="text-2xl font-heading uppercase tracking-wider text-white">
              Verifikasi Identitas
            </h3>
          </div>
          {!isLoading && (
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-neutral-card border-l-4 border-accent-gold">
            <p className="text-sm text-text-body mb-1 font-medium">Customer:</p>
            <p className="text-lg font-bold text-text-primary">{customerName}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wider text-text-primary mb-3">
              Nama Penerima <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-text-body mb-3 leading-relaxed">
              Masukkan nama lengkap sesuai KTP/identitas yang ditunjukkan
            </p>
            <input
              type="text"
              value={pickedUpBy}
              onChange={(e) => {
                setPickedUpBy(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && pickedUpBy.trim()) {
                  handleSubmit();
                }
              }}
              placeholder="Contoh: Ahmad Zainudin"
              className="w-full px-4 py-3 border-2 border-neutral-divider bg-white text-text-body focus:border-accent-gold focus:outline-none font-medium"
              autoFocus
              disabled={isLoading}
              maxLength={100}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400">
            <p className="font-bold text-sm text-yellow-900 mb-3 uppercase tracking-wide">
              ⚠️ Pastikan:
            </p>
            <ul className="text-xs text-yellow-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>KTP/identitas telah diperiksa dan sesuai</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Nama yang diinput sesuai dengan identitas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Barang sudah disiapkan dan siap diserahkan</span>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-transparent text-text-primary border-2 border-text-primary px-6 py-3 hover:bg-text-primary hover:text-white transition-all uppercase tracking-wider font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !pickedUpBy.trim()}
              className="flex-1 bg-accent-gold text-white px-6 py-3 hover:bg-accent-hover transition-all uppercase tracking-wider font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Konfirmasi
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function PickupVerificationPage() {
  const [searchCode, setSearchCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);

  const handleSearch = async (e: any) => {
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

        if (data.data.pickupStatus === 'picked_up') {
          toast.error('Barang sudah diambil sebelumnya!', { duration: 5000 });
        } else if (data.data.paymentStatus === 'pending' && data.data.paymentMethod?.toLowerCase() === 'pay at store') {
          toast('⚠️ Pembayaran belum dikonfirmasi. Terima pembayaran terlebih dahulu.', {
            duration: 5000,
            icon: '💰'
          });
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

  const handleConfirmPayment = async () => {
    if (!order || !order._id) return;

    if (order.paymentStatus === 'paid' || order.paymentStatus === 'settlement') {
      toast.error('Pembayaran sudah dikonfirmasi sebelumnya!');
      return;
    }

    const totalAmount = formatCurrency(order.totalAmount);
    const confirmed = window.confirm(
      `Konfirmasi Pembayaran\n\n` +
      `Total: ${totalAmount}\n` +
      `Apakah pembayaran sebesar ${totalAmount} sudah diterima secara tunai?`
    );

    if (!confirmed) return;

    setConfirmingPayment(true);

    try {
      const response = await fetch(`/api/orders/${order.orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'paid',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Pembayaran berhasil dikonfirmasi!');
        setOrder({
          ...order,
          paymentStatus: 'paid',
          status: 'paid',
        });
      } else {
        toast.error(data.error || 'Gagal konfirmasi pembayaran');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Gagal konfirmasi pembayaran');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handlePickupConfirm = () => {
    if (!order || !order._id) return;

    if (order.pickupStatus === 'picked_up') {
      toast.error('Barang sudah diambil sebelumnya!');
      return;
    }

    if (order.paymentMethod?.toLowerCase() === 'pay at store' &&
      order.paymentStatus === 'pending') {
      toast.error('Harap konfirmasi pembayaran terlebih dahulu!');
      return;
    }

    if (order.status !== 'paid' && order.status !== 'ready_pickup') {
      toast.error('Order belum siap untuk pickup');
      return;
    }

    // Open modal instead of prompt
    setShowPickupModal(true);
  };

  const handleModalConfirm = async (pickedUpBy: string) => {
    if (!order || !order._id) return;

    setVerifying(true);

    try {
      const response = await fetch(`/api/orders/${order.orderId}/pickup`, {
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
        setShowPickupModal(false);

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

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
      case 'settlement':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    const method = paymentMethod?.toLowerCase() || '';
    return method === 'pay at store' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getPaymentMethodLabel = (paymentMethod?: string) => {
    const method = (paymentMethod || 'unknown').toLowerCase();
    return method === 'pay at store' ? 'Pay at Store' : 'Virtual/Online';
  };

  const isPayAtStore = order?.paymentMethod?.toLowerCase() === 'pay at store';
  const isPaymentPending = order?.paymentStatus === 'pending';
  const needsPaymentConfirmation = isPayAtStore && isPaymentPending;

  return (
    <div className="container py-8 max-w-4xl">
      {/* Pickup Confirmation Modal */}
      <PickupConfirmationModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onConfirm={handleModalConfirm}
        customerName={order?.customerInfo.name || ''}
        isLoading={verifying}
      />

      <h1 className="text-4xl font-heading mb-8 text-center uppercase tracking-wider border-b-4 border-accent-gold pb-3 inline-block w-full">
        Verifikasi Pickup Barang
      </h1>

      {/* Search Form */}
      <div className="bg-white p-8 rounded-none border-2 border-neutral-divider shadow-md mb-8">
        <label className="block text-sm font-semibold uppercase tracking-wider text-text-primary mb-3">
          Kode Pickup
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
              placeholder="XXXXXX"
              className="w-full text-center text-3xl font-mono tracking-widest uppercase px-6 py-4 border-2 border-neutral-divider bg-white text-text-body focus:border-accent-gold focus:outline-none font-bold"
              maxLength={6}
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary px-10 flex items-center gap-2 text-lg"
          >
            <Search size={24} />
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </div>

      {/* Order Details */}
      {order && (
        <div className="bg-white rounded-none border-2 border-neutral-divider shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div
            className={`p-6 ${order.pickupStatus === 'picked_up'
              ? 'bg-blue-600 text-white'
              : needsPaymentConfirmation
                ? 'bg-orange-600 text-white'
                : order.status === 'paid' || order.status === 'ready_pickup'
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {order.pickupStatus === 'picked_up' ? (
                  <>
                    <CheckCircle size={32} />
                    <span className="text-2xl font-heading uppercase tracking-wider">Barang Sudah Diambil</span>
                  </>
                ) : needsPaymentConfirmation ? (
                  <>
                    <DollarSign size={32} />
                    <span className="text-2xl font-heading uppercase tracking-wider">Menunggu Pembayaran</span>
                  </>
                ) : order.status === 'paid' || order.status === 'ready_pickup' ? (
                  <>
                    <Package size={32} />
                    <span className="text-2xl font-heading uppercase tracking-wider">Siap Untuk Pickup</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={32} />
                    <span className="text-2xl font-heading uppercase tracking-wider">Pembayaran Pending</span>
                  </>
                )}
              </div>
              <div className="text-4xl font-mono font-bold tracking-widest">{order.pickupCode}</div>
            </div>
          </div>

          {/* Payment Warning for Pay at Store */}
          {needsPaymentConfirmation && (
            <div className="bg-orange-50 border-l-4 border-orange-600 p-6 m-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={28} />
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-orange-900 mb-2 uppercase tracking-wide">
                    Pembayaran Belum Dikonfirmasi
                  </h4>
                  <p className="text-sm text-orange-800 mb-4 leading-relaxed">
                    Customer memilih metode <strong>"Pay at Store"</strong>. Harap terima pembayaran tunai sebesar{' '}
                    <strong className="text-accent-gold text-lg">{formatCurrency(order.totalAmount)}</strong> dan konfirmasi pembayaran
                    sebelum melakukan pickup.
                  </p>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-none font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                  >
                    <CreditCard size={20} />
                    {confirmingPayment ? 'Memproses...' : 'Konfirmasi Pembayaran Diterima'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="border-2 border-neutral-divider p-6">
                <h3 className="font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-lg border-b-2 border-accent-gold pb-2">
                  <Hash size={24} />
                  Informasi Order
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-body font-medium">Order ID:</span>
                    <span className="font-bold">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body font-medium">Tanggal:</span>
                    <span className="font-bold">
                      {order.createdAt && formatOrderDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-body font-medium">Total:</span>
                    <span className="font-bold text-xl text-accent-gold">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-body font-medium">Status:</span>
                    <span className={`badge ${getStatusColor(order.status)} uppercase`}>{order.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-body font-medium">Metode Pembayaran:</span>
                    <span className={`badge ${getPaymentMethodColor(order.paymentMethod)} uppercase`}>
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-body font-medium">Status Pembayaran:</span>
                    <span className={`badge ${getPaymentStatusColor(order.paymentStatus)} uppercase`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-neutral-divider p-6">
                <h3 className="font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-lg border-b-2 border-accent-gold pb-2">
                  <User size={24} />
                  Data Customer
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-body font-medium">Nama:</span>
                    <span className="font-bold">{order.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body font-medium">Phone:</span>
                    <span className="font-bold">{order.customerInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-body font-medium">Email:</span>
                    <span className="font-semibold text-xs break-all">{order.customerInfo.email}</span>
                  </div>
                  {order.pickupStatus === 'picked_up' && order.pickedUpBy && (
                    <>
                      <div className="pt-3 border-t-2 border-neutral-divider mt-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-text-body font-medium">Diambil oleh:</span>
                          <span className="font-bold">{order.pickedUpBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-body font-medium">Waktu pickup:</span>
                          <span className="font-bold">
                            {order.pickedUpAt && formatOrderDate(order.pickedUpAt)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-2 border-neutral-divider">
              <div className="bg-neutral-card p-4 border-b-2 border-neutral-divider">
                <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-lg">
                  <Package size={24} />
                  Item yang Dibeli
                </h3>
              </div>
              <div>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-4 border-b-2 border-neutral-divider last:border-b-0 hover:bg-neutral-card/50 transition-colors">
                    <div>
                      <p className="font-bold text-sm">{(item.product as Product).name || 'Product'}</p>
                      <p className="text-xs text-text-body uppercase font-medium mt-1">
                        {item.category} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-accent-gold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {order.pickupStatus !== 'picked_up' && (
              <div className="mt-8 space-y-4">
                {needsPaymentConfirmation && (
                  <button
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-none font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-md text-lg"
                  >
                    <CreditCard size={24} />
                    {confirmingPayment ? 'Memproses...' : `Konfirmasi Pembayaran ${formatCurrency(order.totalAmount)}`}
                  </button>
                )}

                {(order.status === 'paid' || order.status === 'ready_pickup') && (
                  <div className="flex gap-4">
                    <button
                      onClick={handlePickupConfirm}
                      disabled={verifying || needsPaymentConfirmation}
                      className={`btn-primary flex-1 flex items-center justify-center gap-3 text-lg py-4 ${needsPaymentConfirmation ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <CheckCircle size={24} />
                      {verifying ? 'Memproses...' : 'Konfirmasi Pickup'}
                    </button>
                    <button
                      onClick={() => {
                        setSearchCode('');
                        setOrder(null);
                      }}
                      className="btn-secondary px-8 flex items-center gap-2"
                    >
                      <X size={20} />
                      Reset
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pickup Success Message */}
            {order.pickupStatus === 'picked_up' && (
              <div className="mt-8 p-6 bg-blue-600 text-white rounded-none border-2 border-blue-700 shadow-md">
                <div className="flex items-start gap-4">
                  <CheckCircle size={32} className="flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xl uppercase tracking-wide mb-2">
                      Pickup Berhasil Dikonfirmasi
                    </p>
                    <p className="text-blue-100 font-medium">
                      Barang sudah diambil oleh <strong className="text-white">{order.pickedUpBy}</strong> pada{' '}
                      <strong className="text-white">{order.pickedUpAt && formatOrderDate(order.pickedUpAt)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-white border-2 border-neutral-divider rounded-none p-8 shadow-md">
        <h3 className="font-bold uppercase tracking-wider mb-4 text-xl border-b-2 border-accent-gold pb-2">
          📋 Prosedur Verifikasi Pickup
        </h3>
        <ol className="list-decimal list-inside space-y-3 text-sm text-text-body leading-relaxed">
          <li className="font-medium">Minta customer menunjukkan kode pickup atau bukti pembayaran WhatsApp</li>
          <li className="font-medium">Masukkan kode pickup 6 digit ke form di atas</li>
          <li className="font-medium">
            <strong className="text-text-primary">Jika metode "Pay at Store":</strong> Terima pembayaran tunai dan klik
            "Konfirmasi Pembayaran"
          </li>
          <li className="font-medium">Verifikasi nama customer sesuai dengan data order</li>
          <li className="font-medium">Minta customer menunjukkan KTP/identitas</li>
          <li className="font-medium">Siapkan barang sesuai list yang tertera</li>
          <li className="font-medium">Klik "Konfirmasi Pickup" dan masukkan nama penerima sesuai KTP</li>
          <li className="font-medium">Serahkan barang kepada customer</li>
        </ol>
      </div>
    </div>
  );
}