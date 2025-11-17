import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// PUT /api/orders/[id]/status - Update order status (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required',
        },
        { status: 400 }
      );
    }

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Update status using the model method
    await order.updateStatus(status);

    // Update payment status if order is paid
    if (status === 'paid' || status === 'completed') {
      order.paymentStatus = 'paid';
      await order.save();
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
