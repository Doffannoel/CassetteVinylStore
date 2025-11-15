import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// PUT /api/orders/[id]/pickup - Confirm order pickup
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
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

    const { pickupStatus, pickedUpBy, pickedUpAt } = await request.json();

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

    // Check if order is ready for pickup
    if (order.status !== 'paid' && order.status !== 'ready_pickup') {
      return NextResponse.json(
        {
          success: false,
          error: 'Order is not ready for pickup',
        },
        { status: 400 }
      );
    }

    // Check if already picked up
    if (order.pickupStatus === 'picked_up') {
      return NextResponse.json(
        {
          success: false,
          error: 'Order has already been picked up',
        },
        { status: 400 }
      );
    }

    // Update pickup status
    order.pickupStatus = pickupStatus;
    order.pickedUpBy = pickedUpBy;
    order.pickedUpAt = pickedUpAt || new Date();

    // Update order status to completed if picked up
    if (pickupStatus === 'picked_up') {
      order.status = 'completed';
      order.completedAt = new Date();
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Pickup confirmed successfully',
    });
  } catch (error: any) {
    console.error('Error confirming pickup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to confirm pickup',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
