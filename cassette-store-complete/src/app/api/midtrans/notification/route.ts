// src\app\api\midtrans\notification\route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify signature key from Midtrans
    const signatureKey = crypto
      .createHash('sha512')
      .update(
        `${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`
      )
      .digest('hex');

    if (signatureKey !== body.signature_key) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
    }

    await connectDB();

    // Find order by Midtrans order ID
    const order = await Order.findOne({
      $or: [
        { orderId: body.order_id },
        { midtransTransactionId: body.transaction_id },
        { midtransOrderIds: body.order_id },
      ],
    });

    if (!order) {
      console.error('Order not found:', body.order_id);
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Update order based on transaction status
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    let orderStatus = order.status;
    let paymentStatus = order.paymentStatus;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        orderStatus = 'pending';
        paymentStatus = 'pending';
      } else if (fraudStatus === 'accept') {
        orderStatus = 'paid';
        paymentStatus = 'paid';
        // Reduce stock if not already reduced
        if (!order.stockReduced) {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity },
            });
          }
          order.stockReduced = true;
        }
      }
    } else if (transactionStatus === 'settlement') {
      orderStatus = 'paid';
      paymentStatus = 'paid';
      // Reduce stock if not already reduced
      if (!order.stockReduced) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }
        order.stockReduced = true;
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      orderStatus = 'cancelled';
      paymentStatus = 'failed';
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
      paymentStatus = 'pending';
    } else if (transactionStatus === 'refund') {
      orderStatus = 'refunded';
      paymentStatus = 'refunded';
    }

    // Update order in database
    order.status = orderStatus;
    order.paymentStatus = paymentStatus;
    order.midtransTransactionId = body.transaction_id;
    order.paymentMethod = body.payment_type;

    await order.save();

    console.log(`Order ${order.orderId} updated: status=${orderStatus}, payment=${paymentStatus}`);

    return NextResponse.json({
      success: true,
      message: 'Notification processed',
    });
  } catch (error: any) {
    console.error('Error processing Midtrans notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process notification',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
