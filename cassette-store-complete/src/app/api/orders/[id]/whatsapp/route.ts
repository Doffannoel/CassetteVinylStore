import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// PUT /api/orders/[id]/whatsapp - Update WhatsApp sent status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { whatsappSent } = await request.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      {
        whatsappSent,
        whatsappSentAt: whatsappSent ? new Date() : undefined,
      },
      { new: true }
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
      message: 'WhatsApp status updated',
    });
  } catch (error: any) {
    console.error('Error updating WhatsApp status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update WhatsApp status',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
