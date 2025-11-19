'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Package, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyStats {
    date: string;
    revenue: number;
    itemsSold: number;
    orders: number;
}

interface StatsData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    pendingOrders: number;
    dailyStats: DailyStats[];
    topProducts: { name: string; sold: number; revenue: number }[];
    recentOrders: any[];
}

const AdminStats = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Fetch orders data
            const ordersResponse = await fetch('/api/orders', {
                credentials: 'include',
            });

            if (ordersResponse.status === 401) {
                window.location.href = '/login?redirect=/admin';
                return;
            }

            const ordersData = await ordersResponse.json();

            if (!ordersData.success) {
                console.error('Failed to fetch orders');
                return;
            }

            // Fetch basic stats
            const statsResponse = await fetch(`/api/admin/stats?range=${timeRange}`, {
                credentials: 'include',
            });

            const statsData = await statsResponse.json();

            if (!statsData.success) {
                console.error('Failed to fetch stats');
                return;
            }

            // Process orders to get daily statistics
            const orders = ordersData.data.orders || [];
            const dailyData = processOrdersByDay(orders, timeRange);

            setStats({
                totalRevenue: statsData.data.totalRevenue,
                totalOrders: statsData.data.totalOrders,
                totalProducts: statsData.data.totalProducts,
                pendingOrders: statsData.data.pendingOrders,
                dailyStats: dailyData,
                topProducts: statsData.data.topProducts || [],
                recentOrders: statsData.data.recentOrders || [],
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const processOrdersByDay = (orders: any[], range: string) => {
        const now = new Date();
        let days = 30;

        if (range === 'week') days = 7;
        if (range === 'year') days = 365;

        // Initialize daily data
        const dailyMap = new Map<string, DailyStats>();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            dailyMap.set(dateStr, {
                date: formatDate(date, range),
                revenue: 0,
                itemsSold: 0,
                orders: 0,
            });
        }

        // Process orders
        orders.forEach((order: any) => {
            if (!['paid', 'shipped', 'completed'].includes(order.status)) return;

            const orderDate = new Date(order.createdAt);
            const dateStr = orderDate.toISOString().split('T')[0];

            if (dailyMap.has(dateStr)) {
                const dayData = dailyMap.get(dateStr)!;
                dayData.revenue += order.totalAmount || 0;
                dayData.orders += 1;

                // Count items sold
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item: any) => {
                        dayData.itemsSold += item.quantity || 0;
                    });
                }
            }
        });

        return Array.from(dailyMap.values());
    };

    const formatDate = (date: Date, range: string) => {
        if (range === 'week') {
            return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        }
        if (range === 'year') {
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
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

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-neutral-divider p-4 shadow-lg rounded">
                    <p className="font-semibold mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.name}: {entry.dataKey === 'revenue' ? formatPrice(entry.value) : `${formatNumber(entry.value)} items`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
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

    return (
        <div className="space-y-6">
            {/* Header with Time Range Filter */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-semibold">Statistics & Analytics</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === 'week'
                            ? 'bg-accent-gold text-white'
                            : 'bg-white border border-neutral-divider hover:bg-gray-50'
                            }`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === 'month'
                            ? 'bg-accent-gold text-white'
                            : 'bg-white border border-neutral-divider hover:bg-gray-50'
                            }`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setTimeRange('year')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${timeRange === 'year'
                            ? 'bg-accent-gold text-white'
                            : 'bg-white border border-neutral-divider hover:bg-gray-50'
                            }`}
                    >
                        1 Year
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="bg-white border border-neutral-divider p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm uppercase tracking-wider text-text-body">Total Products</p>
                        <Package className="text-purple-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-text-primary">{formatNumber(stats.totalProducts)}</p>
                    <p className="text-xs text-text-body mt-2">Active in catalog</p>
                </div>

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

            {/* Chart Type Selector */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setChartType('line')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${chartType === 'line'
                        ? 'bg-accent-gold text-white'
                        : 'bg-white border border-neutral-divider hover:bg-gray-50'
                        }`}
                >
                    Line Chart
                </button>
                <button
                    onClick={() => setChartType('bar')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${chartType === 'bar'
                        ? 'bg-accent-gold text-white'
                        : 'bg-white border border-neutral-divider hover:bg-gray-50'
                        }`}
                >
                    Bar Chart
                </button>
            </div>

            {/* Charts Section - Separated */}
            <div className="grid grid-cols-1 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white border border-neutral-divider p-6">
                    <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">
                        Pendapatan Per Hari
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        {chartType === 'line' ? (
                            <LineChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="#d4af37"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => formatPrice(value)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="line"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#d4af37"
                                    strokeWidth={3}
                                    dot={{ fill: '#d4af37', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Pendapatan (IDR)"
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="#d4af37"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => formatPrice(value)}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#d4af37"
                                    name="Pendapatan (IDR)"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Items Sold Chart */}
                <div className="bg-white border border-neutral-divider p-6">
                    <h3 className="text-lg font-semibold mb-6 uppercase tracking-wider">
                        Jumlah Item Terjual Per Hari
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        {chartType === 'line' ? (
                            <LineChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="#3b82f6"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="line"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="itemsSold"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Item Terjual"
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={stats.dailyStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6b7280"
                                    style={{ fontSize: '12px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    stroke="#3b82f6"
                                    style={{ fontSize: '12px' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                                <Bar
                                    dataKey="itemsSold"
                                    fill="#3b82f6"
                                    name="Item Terjual"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
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