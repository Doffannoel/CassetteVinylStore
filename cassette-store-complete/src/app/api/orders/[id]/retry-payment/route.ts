import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await connectDB();

    const order = await Order.findOne({ orderId: id }).populate('items.product');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending' && order.paymentStatus !== 'failed') {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak bisa dibayar ulang.' },
        { status: 400 }
      );
    }

    for (const item of order.items as any[]) {
      // Cast to any[] to access product properties
      // Ensure product is populated and has a stock property
      if (item.product && item.product.stock !== undefined && item.product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Stok tidak cukup: ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    const midtransOrderId = `${order.orderId}-${Date.now()}`;

    const transactionParams = {
      transaction_details: {
        order_id: midtransOrderId,
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
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.orderId}`,
      },
    };

    const transaction = await snap.createTransaction(transactionParams);

    if (!order.midtransOrderIds) order.midtransOrderIds = [];
    order.midtransOrderIds.push(midtransOrderId);

    order.midtransToken = transaction.token;
    order.midtransRedirectUrl = transaction.redirect_url;
    order.paymentStatus = 'pending';
    order.status = 'pending';

    await order.save();

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      message: 'Token pembayaran berhasil dibuat.',
    });
  } catch (error: any) {
    console.error('Midtrans retry error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat transaksi.', message: error.message },
      { status: 500 }
    );
  }
}
