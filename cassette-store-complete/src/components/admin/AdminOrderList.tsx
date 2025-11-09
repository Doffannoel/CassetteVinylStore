'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { Loader2, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        return <Package className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
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
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <h2 className="text-2xl font-semibold mb-6">Orders ({orders.length})</h2>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-divider rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-card">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-divider">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-card/50">
                  <td className="px-4 py-3 font-medium">
                    {order.orderId}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{order.customerInfo.name}</p>
                      <p className="text-sm text-text-body">{order.customerInfo.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {order.items.length} items
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {order.createdAt && new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye size={18} />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id!, e.target.value)}
                        className="text-sm border border-neutral-divider px-2 py-1 rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Order Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium">Order ID: {selectedOrder.orderId}</p>
                <p className="text-sm text-text-body">
                  Date: {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <p>{selectedOrder.customerInfo.name}</p>
                <p>{selectedOrder.customerInfo.email}</p>
                <p>{selectedOrder.customerInfo.phone}</p>
                <p>{selectedOrder.customerInfo.address}</p>
                <p>{selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.postalCode}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <div>
                      <p>{item.name || 'Product'}</p>
                      <p className="text-sm text-text-body">
                        {item.category} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <p className="font-semibold">Total:</p>
                  <p className="font-semibold text-accent-gold">
                    {formatPrice(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="btn-primary mt-6"
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
