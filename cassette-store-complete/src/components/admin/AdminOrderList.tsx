'use client';

import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/types';
import { Loader2, Eye, Package, Ban, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, RefreshCw, Banknote, Smartphone, Search, X, Check, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Multiple filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminPassword')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminPassword')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const confirmPayment = async (orderId: string) => {
    const confirmed = window.confirm(
      'Apakah Anda yakin pembayaran untuk order ini sudah diterima?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'paid'
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('✅ Pembayaran berhasil dikonfirmasi!');
        fetchOrders();
      } else {
        toast.error(data.error || 'Gagal konfirmasi pembayaran');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Gagal konfirmasi pembayaran');
    }
  };

  // Filter dan Search Logic
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter berdasarkan order status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter berdasarkan payment status
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentStatusFilter);
    }

    // Filter berdasarkan payment method
    if (paymentMethodFilter !== 'all') {
      const filterMethod = paymentMethodFilter.toLowerCase();
      filtered = filtered.filter(order => {
        const orderMethod = (order.paymentMethod || '').toLowerCase();
        if (filterMethod === 'pay at store') {
          return orderMethod === 'pay at store';
        } else if (filterMethod === 'virtual') {
          return orderMethod !== 'pay at store';
        }
        return true;
      });
    }

    // Search berdasarkan Order ID, Customer Name, atau Email
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(query) ||
        order.customerInfo.name.toLowerCase().includes(query) ||
        order.customerInfo.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [orders, statusFilter, paymentStatusFilter, paymentMethodFilter, searchQuery]);

  // Hitung jumlah order per kategori
  const filterCounts = useMemo(() => {
    return {
      // Order Status
      status: {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        paid: orders.filter(o => o.status === 'paid').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
      // Payment Status
      paymentStatus: {
        all: orders.length,
        pending: orders.filter(o => o.paymentStatus === 'pending').length,
        paid: orders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'settlement').length,
        failed: orders.filter(o => o.paymentStatus === 'failed' || o.paymentStatus === 'deny').length,
        expired: orders.filter(o => o.paymentStatus === 'expired' || o.paymentStatus === 'expire').length,
      },
      // Payment Method
      paymentMethod: {
        all: orders.length,
        payAtStore: orders.filter(o => (o.paymentMethod || '').toLowerCase() === 'pay at store').length,
        virtual: orders.filter(o => (o.paymentMethod || '').toLowerCase() !== 'pay at store').length,
      }
    };
  }, [orders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'paid':
      case 'settlement':
      case 'capture':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'deny':
      case 'failure':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'cancel':
        return <Ban className="w-4 h-4" />;
      case 'expired':
      case 'expire':
        return <AlertCircle className="w-4 h-4" />;
      case 'refund':
      case 'partial_refund':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case 'settlement':
      case 'capture':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'deny':
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
      case 'cancel':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
      case 'expire':
        return 'bg-orange-100 text-orange-800';
      case 'refund':
      case 'partial_refund':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (paymentMethod: string) => {
    const method = paymentMethod?.toLowerCase() || '';
    return method === 'pay at store' ? <Banknote className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />;
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    const method = paymentMethod?.toLowerCase() || '';
    return method === 'pay at store' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getPaymentMethodLabel = (paymentMethod?: string) => {
    const method = (paymentMethod || 'unknown').toLowerCase();
    return method === 'pay at store' ? 'Pay at Store' : 'Virtual/Online';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-heading uppercase tracking-wider text-text-primary border-b-4 border-accent-gold pb-2">
          Orders ({filteredOrders.length})
        </h2>

        {/* Toggle Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-primary flex items-center gap-2"
        >
          <Filter size={20} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Search and Filters - Collapsible */}
      {showFilters && (
        <div className="mb-6 bg-white p-6 rounded-none border-2 border-neutral-divider shadow-md animate-fadeIn">
          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-semibold uppercase tracking-wider text-text-primary mb-2">
              Search Orders
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-gold w-5 h-5" />
              <input
                type="text"
                placeholder="ORDER ID, CUSTOMER NAME, OR EMAIL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-neutral-divider bg-white text-text-body focus:border-accent-gold focus:outline-none uppercase placeholder:text-gray-400 placeholder:normal-case font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-body hover:text-accent-gold transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-text-primary mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-divider bg-white text-text-body focus:border-accent-gold focus:outline-none font-medium uppercase text-sm appearance-none cursor-pointer hover:border-accent-hover transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C5A572' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">ALL METHODS ({filterCounts.paymentMethod.all})</option>
                <option value="pay at store">PAY AT STORE ({filterCounts.paymentMethod.payAtStore})</option>
                <option value="virtual">VIRTUAL/ONLINE ({filterCounts.paymentMethod.virtual})</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-text-primary mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-divider bg-white text-text-body focus:border-accent-gold focus:outline-none font-medium uppercase text-sm appearance-none cursor-pointer hover:border-accent-hover transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C5A572' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">ALL STATUS ({filterCounts.paymentStatus.all})</option>
                <option value="pending">PENDING ({filterCounts.paymentStatus.pending})</option>
                <option value="paid">PAID ({filterCounts.paymentStatus.paid})</option>
                <option value="failed">FAILED ({filterCounts.paymentStatus.failed})</option>
                <option value="expired">EXPIRED ({filterCounts.paymentStatus.expired})</option>
              </select>
            </div>

            {/* Order Status Filter */}
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-text-primary mb-2">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-divider bg-white text-text-body focus:border-accent-gold focus:outline-none font-medium uppercase text-sm appearance-none cursor-pointer hover:border-accent-hover transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C5A572' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="all">ALL STATUS ({filterCounts.status.all})</option>
                <option value="pending">PENDING ({filterCounts.status.pending})</option>
                <option value="processing">PROCESSING ({filterCounts.status.processing})</option>
                <option value="paid">PAID ({filterCounts.status.paid})</option>
                <option value="completed">COMPLETED ({filterCounts.status.completed})</option>
                <option value="cancelled">CANCELLED ({filterCounts.status.cancelled})</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border-2 border-neutral-divider rounded-none overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-card border-b-2 border-neutral-divider">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Order ID
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Customer
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Items
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Total
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Payment Method
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Payment Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-divider">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500 uppercase tracking-wide font-medium">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-neutral-card/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-sm">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-sm">{order.customerInfo.name}</p>
                        <p className="text-xs text-text-body">{order.customerInfo.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-sm">
                      {order.items.length} items
                    </td>
                    <td className="px-4 py-4 font-bold text-accent-gold">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${getPaymentMethodColor(order.paymentMethod)} flex items-center gap-1 w-fit`}>
                        {getPaymentMethodIcon(order.paymentMethod)}
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${getPaymentStatusColor(order.paymentStatus)} flex items-center gap-1 w-fit`}>
                        {getPaymentStatusIcon(order.paymentStatus)}
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      {order.createdAt && new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-accent-gold hover:bg-accent-gold hover:text-white rounded-none border border-accent-gold transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {order.paymentMethod?.toLowerCase() === 'pay at store' &&
                          order.paymentStatus === 'pending' && (
                            <button
                              onClick={() => confirmPayment(order._id!)}
                              className="px-3 py-2 bg-accent-gold hover:bg-accent-hover text-white rounded-none flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                              title="Konfirmasi Pembayaran Diterima"
                            >
                              <Check size={16} />
                              Confirm
                            </button>
                          )}

                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id!, e.target.value)}
                          className="text-xs border-2 border-neutral-divider px-3 py-2 rounded-none font-semibold uppercase focus:border-accent-gold focus:outline-none hover:border-accent-hover transition-colors cursor-pointer"
                        >
                          <option value="pending">PENDING</option>
                          <option value="processing">PROCESSING</option>
                          <option value="paid">PAID</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-none max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-accent-gold shadow-2xl">
            <h3 className="text-2xl font-heading uppercase tracking-wider mb-6 border-b-2 border-accent-gold pb-3">Order Details</h3>

            <div className="space-y-6">
              <div className="bg-neutral-card p-4">
                <p className="font-bold text-lg uppercase tracking-wide">Order ID: {selectedOrder.orderId}</p>
                <p className="text-sm text-text-body mt-1">
                  Date: {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wide mb-3 text-text-primary">Customer Information</h4>
                <div className="bg-neutral-card p-4 space-y-2">
                  <p className="font-semibold">{selectedOrder.customerInfo.name}</p>
                  <p className="text-sm">{selectedOrder.customerInfo.email}</p>
                  <p className="text-sm">{selectedOrder.customerInfo.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wide mb-3 text-text-primary">Order Items</h4>
                <div className="border-2 border-neutral-divider">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-4 border-b-2 border-neutral-divider last:border-b-0 hover:bg-neutral-card/50 transition-colors">
                      <div>
                        <p className="font-semibold">{item.name || 'Product'}</p>
                        <p className="text-sm text-text-body uppercase">
                          {item.category} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-accent-gold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between p-4 bg-neutral-card">
                    <p className="font-bold uppercase tracking-wider">Total:</p>
                    <p className="font-bold text-xl text-accent-gold">
                      {formatPrice(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="btn-primary mt-8 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;