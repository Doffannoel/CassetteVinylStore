import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET /api/orders/search - Search order by orderId or pickupCode
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const pickupCode = searchParams.get('pickupCode');

    if (!orderId && !pickupCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order ID or Pickup Code is required',
        },
        { status: 400 }
      );
    }

    let query: any = {};
    if (orderId) {
      query.orderId = orderId;
    }
    if (pickupCode) {
      query.pickupCode = pickupCode;
    }

    const order = await Order.findOne(query).populate('items.product').lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error searching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search order',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
