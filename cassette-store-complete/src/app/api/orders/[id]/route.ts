import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

// GET /api/orders/[id] - Get single order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    let order;
    const productPopulation = {
      path: 'items.product',
      select: 'name artist images',
    };

    // The 'id' param can be either the MongoDB _id or the custom orderId string
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate(productPopulation).lean();
    }

    if (!order) {
      order = await Order.findById(id)
        .populate(productPopulation)
        .lean();
    }

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
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    const body = await request.json();

    const order = await Order.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

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
      message: 'Order updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
