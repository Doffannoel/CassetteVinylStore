import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken, JWTPayload } from '@/utils/auth';

// PUT /api/orders/[id]/status - Update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
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

    // Check if user is admin
    if (payload.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - Admin access required',
        },
        { status: 403 }
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

    const { id } = params;

    const order = await Order.findById(id);

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