'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Package, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface StatsData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    pendingOrders: number;
    revenueByMonth: { month: string; revenue: number; orders: number }[];
    revenueByCategory: { category: string; revenue: number; count: number }[];
    recentOrders: any[];
    topProducts: { name: string; sold: number; revenue: number }[];
}

const AdminStats = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/admin/stats?range=${timeRange}`, {
                credentials: 'include',
            });

            const data = await response.json();

            if (response.status === 401) {
                toast.error('Session expired. Please login again.');
                window.location.href = '/login?redirect=/admin';
                return;
            }

            if (data.success) {
                setStats(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to fetch statistics');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">No statistics available</p>
            </div>
        );
    }

    const maxRevenue = Math.max(...stats.revenueByMonth.map(m => m.revenue));

    return (
        <div className="space-y-6">
            {/* Header with Time Range Filter */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Statistics & Analytics</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === 'week'
                                ? 'bg-accent-gold text-white'
                                : 'bg-white border border-neutral-divider hover:bg-gray-50'
                            }`}
                    >
                        This Week
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === 'month'
                                ? 'bg-accent-gold text-white'
                                : 'bg-white border border-neutral-divider hover:bg-gray-50'
                            }`}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setTimeRange('year')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === 'year'
                                ? 'bg-accent-gold text-white'
                                : 'bg-white border border-neutral-divider hover:bg-gray-50'
                            }`}
                    >
                        This Year
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white border border-neutral-divider p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm uppercase tracking-wider text-text-body">Total Revenue</p>
                        <DollarSign className="text-accent-gold" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-accent-gold">{formatPrice(stats.totalRevenue)}</p>
                    <p className="text-xs text-text-body mt-2 flex items-center gap-1">
                        <TrendingUp size={14} />
                        From {stats.totalOrders} orders
                    </p>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-neutral-divider p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm uppercase tracking-wider text-text-body">Total Orders</p>
                        <ShoppingCart className="text-blue-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{formatNumber(stats.totalOrders)}</p>
                    <p className="text-xs text-text-body mt-2">
                        {stats.pendingOrders} pending orders
                    </p>
                </div>

                {/* Total Products */}
                <div className="bg-white border border-neutral-divider p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm uppercase tracking-wider text-text-body">Total Products</p>
                        <Package className="text-purple-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{formatNumber(stats.totalProducts)}</p>
                    <p className="text-xs text-text-body mt-2">Active in catalog</p>
                </div>

                {/* Average Order Value */}
                <div className="bg-white border border-neutral-divider p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm uppercase tracking-wider text-text-body">Avg Order Value</p>
                        <Calendar className="text-green-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-text-primary">
                        {formatPrice(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
                    </p>
                    <p className="text-xs text-text-body mt-2">Per transaction</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Month Chart */}
                <div className="bg-white border border-neutral-divider p-6">
                    <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">Revenue Trend</h3>
                    <div className="space-y-4">
                        {stats.revenueByMonth.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{item.month}</span>
                                    <span className="text-accent-gold font-bold">{formatPrice(item.revenue)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-text-body mb-2">
                                    <span>{item.orders} orders</span>
                                    <span>
                                        {maxRevenue > 0 ? Math.round((item.revenue / maxRevenue) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="h-3 bg-neutral-card">
                                    <div
                                        className="h-full bg-accent-gold transition-all"
                                        style={{
                                            width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue by Category */}
                <div className="bg-white border border-neutral-divider p-6">
                    <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">
                        Sales by Category
                    </h3>
                    <div className="space-y-6">
                        {stats.revenueByCategory.map((item, index) => {
                            const maxCategoryRevenue = Math.max(...stats.revenueByCategory.map(c => c.revenue));
                            const percentage = maxCategoryRevenue > 0 ? (item.revenue / maxCategoryRevenue) * 100 : 0;

                            return (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold uppercase text-sm">{item.category}</p>
                                            <p className="text-xs text-text-body">{item.count} items sold</p>
                                        </div>
                                        <p className="text-lg font-bold text-accent-gold">{formatPrice(item.revenue)}</p>
                                    </div>
                                    <div className="h-2 bg-neutral-card">
                                        <div
                                            className="h-full bg-accent-gold transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            {stats.topProducts && stats.topProducts.length > 0 && (
                <div className="bg-white border border-neutral-divider">
                    <div className="p-6 border-b border-neutral-divider">
                        <h3 className="text-lg font-semibold uppercase tracking-wider">Top Selling Products</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-card">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Units Sold
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-divider">
                                {stats.topProducts.slice(0, 10).map((product, index) => (
                                    <tr key={index} className="hover:bg-neutral-card/50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-lg text-accent-gold">#{index + 1}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{product.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold">{formatNumber(product.sold)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-accent-gold">
                                                {formatPrice(product.revenue)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Orders Summary */}
            {stats.recentOrders && stats.recentOrders.length > 0 && (
                <div className="bg-white border border-neutral-divider">
                    <div className="p-6 border-b border-neutral-divider">
                        <h3 className="text-lg font-semibold uppercase tracking-wider">Recent Orders</h3>
                    </div>
                    <div className="divide-y divide-neutral-divider">
                        {stats.recentOrders.slice(0, 5).map((order, index) => (
                            <div key={index} className="p-6 hover:bg-neutral-card/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">Order #{order.orderId}</p>
                                        <p className="text-sm text-text-body mt-1">{order.customerInfo.name}</p>
                                        <p className="text-xs text-text-body">
                                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-accent-gold text-lg">{formatPrice(order.totalAmount)}</p>
                                        <span
                                            className={`inline-block mt-2 px-2 py-1 text-xs font-semibold uppercase ${order.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : order.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStats;