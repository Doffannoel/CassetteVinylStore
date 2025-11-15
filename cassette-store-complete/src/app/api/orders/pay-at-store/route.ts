import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

// POST /api/orders/pay-at-store - Create new order for in-store payment
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

    // Generate order ID
    const orderId = Order.generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      items: orderItems,
      customerInfo,
      totalAmount,
      status: 'processing', // 'processing' because it's ready for pickup
      paymentStatus: 'pending',
      paymentMethod: 'Pay at Store',
    });

    // Reduce stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          stock: -item.quantity,
          soldCount: item.quantity,
        },
      });
    }

    // Populate product details for response
    const populatedOrder = await Order.findById(order._id).populate('items.product');

    return NextResponse.json(
      {
        success: true,
        data: populatedOrder,
        message: 'Order created successfully for in-store payment',
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
