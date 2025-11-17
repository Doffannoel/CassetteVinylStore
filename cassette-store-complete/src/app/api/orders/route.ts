import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

import { verifyToken, JWTPayload } from '@/utils/auth';
import { cookies } from 'next/headers';

// GET /api/orders - Get orders for the logged-in user OR all orders for admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = verifyToken<JWTPayload>(token);

    // Admin access (for admin dashboard)
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    const isAdminAccess = authHeader === `Bearer ${adminPassword}`;

    if (isAdminAccess) {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');
      const email = searchParams.get('email');
      const query: any = {};
      if (status) query.status = status;
      if (email) query['customerInfo.email'] = new RegExp(email, 'i');
      
      const skip = (page - 1) * limit;
      const [orders, totalCount] = await Promise.all([
        Order.find(query).populate('items.product').sort('-createdAt').skip(skip).limit(limit).lean(),
        Order.countDocuments(query),
      ]);
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        orders,
        pagination: { currentPage: page, totalPages, totalCount, limit },
      });
    }

    // Regular user access
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.find({ 'customerInfo.email': user.email })
      .populate('items.product')
      .sort('-createdAt')
      .lean();

    return NextResponse.json({ success: true, orders });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders', message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { items, customerInfo } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order must have at least one item',
        },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing customer information',
        },
        { status: 400 }
      );
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            error: `Product not found: ${item.productId}`,
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          },
          { status: 400 }
        );
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        artist: product.artist,
        category: product.category,
      });

      totalAmount += product.price * item.quantity;
    }

    // Generate order ID and pickup code
    const orderId = Order.generateOrderId();
    const pickupCode = Order.generatePickupCode();

    // Create order
    const order = await Order.create({
      orderId,
      items: orderItems,
      customerInfo,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      pickupCode,
    });

    // Populate product details for response
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    if (!populatedOrder) {
      // This case should ideally not be reached as we just created the order
      return NextResponse.json(
        {
          success: false,
          error: 'Could not find the created order.',
        },
        { status: 500 }
      );
    }

    // Create Midtrans transaction
    const transactionDetails = {
      transaction_details: {
        order_id: populatedOrder.orderId,
        gross_amount: populatedOrder.totalAmount,
      },
      customer_details: {
        first_name: populatedOrder.customerInfo.name,
        email: populatedOrder.customerInfo.email,
        phone: populatedOrder.customerInfo.phone,
      },
      item_details: populatedOrder.items.map((item) => ({
        id: item.product._id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
    };

    const snapToken = await snap.createTransactionToken(transactionDetails);

    // Save Midtrans token to order
    populatedOrder.midtransToken = snapToken;
    await populatedOrder.save();

    return NextResponse.json(
      {
        success: true,
        data: populatedOrder,
        snapToken,
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
