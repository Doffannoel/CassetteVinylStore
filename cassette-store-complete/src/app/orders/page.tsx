'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Package, CheckCircle, XCircle, Clock } from 'lucide-react';

// Definisikan tipe Order agar sesuai dengan data yang diterima
interface Order {
  _id: string;
  orderId: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  items: {
    product: {
      _id: string;
      name: string;
      artist: string;
      images: string[]; // Changed from imageUrl to images
    };
    quantity: number;
  }[];
}

// Definisikan tipe untuk respons API retry-payment
interface RetryPaymentResponse {
  success: boolean;
  token?: string;
  error?: string;
}

const OrdersPage = () => {
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load Midtrans Snap script
    const midtransScriptUrl =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    const script = document.createElement('script');
    script.src = midtransScriptUrl; // Ganti ke production jika perlu
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data.orders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, [user, isLoading, router]);

  const handleRetryPayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/retry-payment`, {
        method: 'POST',
      });
      const data: RetryPaymentResponse = await res.json();

      if (data.success && data.token) {
        (window as any).snap.pay(data.token, {
          onSuccess: function (result: any) {
            router.push(`/orders/${orderId}`);
          },
          onPending: function (result: any) {
            router.push(`/orders/${orderId}?status=pending`);
          },
          onError: function (result: any) {
            alert('Payment failed. Please try again.');
          },
          onClose: function () {
            // Do nothing, user stays on the orders page
          },
        });
      } else {
        throw new Error(data.error || 'Failed to get payment token.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusChip = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle size={14} /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={14} /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <XCircle size={14} /> Failed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (isFetching || isLoading) {
    return <div className="container text-center py-20">Loading your orders...</div>;
  }

  if (error) {
    return <div className="container text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container py-12">
        <h1 className="text-3xl font-heading mb-8 text-text-primary">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <Package size={48} className="mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">No Orders Yet</h2>
            <p className="mt-2 text-text-body">You haven't placed any orders with us.</p>
            <Link href="/products" className="btn-primary mt-6">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-neutral-divider rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-lg text-text-primary">Order #{order.orderId}</h2>
                      <p className="text-sm text-text-body mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusChip(order.paymentStatus)}
                      <p className="text-lg font-semibold text-text-primary">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="border-t my-4"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-md mb-3">Items</h3>
                      <div className="flex space-x-4 overflow-x-auto pb-2">
                        {order.items.filter(item => item.product).map((item) => (
                          <div key={item.product._id} className="flex-shrink-0 w-36 text-center">
                            <img
                              src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : ''}
                              alt={item.product.name || 'Product image'}
                              className="w-full h-36 object-cover rounded-md mb-2 shadow-md"
                            />
                            <div className="text-sm">
                              <p className="font-semibold truncate text-text-primary">{item.product.name || 'N/A'}</p>
                              <p className="text-text-body truncate">{item.product.artist || 'N/A'}</p>
                              <p className="text-text-body">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                      <Link href={`/orders/${order._id}`} className="btn-secondary w-full text-center">
                        View Details
                      </Link>
                      {order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handleRetryPayment(order._id)}
                          className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                          <CreditCard size={16} />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
