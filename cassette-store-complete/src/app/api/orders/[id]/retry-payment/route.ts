import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import midtransClient from 'midtrans-client';
import mongoose from 'mongoose';

// Initialize Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    await connectDB();

    // Find the order and populate product details
    const order = await Order.findById(id).populate('items.product');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Allow retry only for pending or failed orders
    if (order.status !== 'pending' && order.paymentStatus !== 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Hanya pesanan yang pending atau gagal yang bisa dicoba bayar ulang.',
        },
        { status: 400 }
      );
    }

    // Re-check stock availability
    for (const item of order.items) {
      const product = item.product as any; // The product is already populated
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Stok untuk ${product.name} tidak mencukupi.`,
          },
          { status: 400 }
        );
      }
    }

    const newOrderId = `CASS-${new Date().getTime()}`;

    const transactionDetails = {
      transaction_details: {
        order_id: newOrderId,
        gross_amount: order.totalAmount,
      },
      customer_details: {
        first_name: order.customerInfo.name,
        email: order.customerInfo.email,
        phone: order.customerInfo.phone,
      },
      item_details: order.items.map((item: any) => ({
        id: item.product._id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: `${item.product.name} - ${item.product.artist}`,
      })),
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order._id}`,
      },
    };

    const transaction = await snap.createTransaction(transactionDetails);
    const { token, redirect_url } = transaction;

    // Update the original order with the new Order ID and Midtrans token
    order.orderId = newOrderId;
    order.midtransToken = token;
    order.midtransRedirectUrl = redirect_url;
    order.status = 'pending';
    order.paymentStatus = 'pending';
    
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Token pembayaran baru telah dibuat.',
      token,
    });
  } catch (error: any) {
    console.error('Error retrying payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mencoba ulang pembayaran.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}