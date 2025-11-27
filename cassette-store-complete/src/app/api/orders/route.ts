import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import midtransClient from 'midtrans-client';
import { verifyToken, JWTPayload } from '@/utils/auth';

// Initialize Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

// GET /api/orders - Get orders for the logged-in user OR all orders for admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = verifyToken<JWTPayload>(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid token',
        },
        { status: 401 }
      );
    }

    // Admin access - get all orders with pagination and filters
    if (payload.role === 'admin') {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');
      const email = searchParams.get('email');

      // Build query
      const query: any = {};
      if (status) {
        query.status = status;
      }
      if (email) {
        query['customerInfo.email'] = new RegExp(email, 'i');
      }

      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        Order.find(query)
          .populate('items.product')
          .sort('-createdAt')
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
          },
        },
      });
    }

    // Regular user access - get only their orders
    const orders = await Order.find({ 'customerInfo.email': payload.email })
      .populate('items.product')
      .sort('-createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        orders,
      },
    });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error.message,
      },
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

    // Generate orderId and pickupCode
    const orderId = Order.generateOrderId();
    const pickupCode = Order.generatePickupCode();

    // Create new order
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

    // Add null check for populatedOrder
    if (!populatedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to retrieve order details',
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
      item_details: populatedOrder.items.map((item: any) => ({
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