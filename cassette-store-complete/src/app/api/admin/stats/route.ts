import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken, JWTPayload } from '@/utils/auth';

// GET /api/admin/stats - Get admin statistics
export async function GET(request: NextRequest) {
  try {
    // Extract token from cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = verifyToken<JWTPayload>(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get total revenue and orders
    const revenueStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'completed'] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const totalOrders = revenueStats[0]?.totalOrders || 0;

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      status: 'pending',
      createdAt: { $gte: startDate },
    });

    // Get total products
    const totalProducts = await Product.countDocuments({ isAvailable: true });

    // Revenue by month (for charts)
    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'completed'] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format revenue by month
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const formattedRevenueByMonth = revenueByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'completed'] },
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const formattedRevenueByCategory = revenueByCategory.map((item) => ({
      category: item._id || 'Unknown',
      revenue: item.revenue,
      count: item.count,
    }));

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'completed'] },
          createdAt: { $gte: startDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          sold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);

    const formattedTopProducts = topProducts.map((item) => ({
      name: item._id || 'Unknown Product',
      sold: item.sold,
      revenue: item.revenue,
    }));

    // Recent orders
    const recentOrders = await Order.find({ createdAt: { $gte: startDate } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        pendingOrders,
        revenueByMonth: formattedRevenueByMonth,
        revenueByCategory: formattedRevenueByCategory,
        topProducts: formattedTopProducts,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        message: error.message,
      },
      { status: 500 }
    );
  }
}