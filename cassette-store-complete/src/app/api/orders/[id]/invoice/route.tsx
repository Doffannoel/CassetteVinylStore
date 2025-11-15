import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken, JWTPayload } from '@/utils/auth';
import mongoose from 'mongoose';
import { renderToBuffer } from '@react-pdf/renderer';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    // Get token dari cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1];

    // Verify user authentication
    const user = verifyToken<JWTPayload>(token);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('API received order ID:', params.id);

    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ success: false, message: 'Invalid Order ID' }, { status: 400 });
    }

    // Get order dan verify ownership
    const order = await Order.findById(params.id).populate('items.product');

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Check if user owns this order atau admin
    if (order.customerInfo.email !== user.email && user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    console.log('Fetched order:', JSON.stringify(order, null, 2));

    // Generate invoice data for PDF
    const invoiceData = {
      _id: order._id?.toString(),
      customerName: order.customerInfo.name,
      customerEmail: order.customerInfo.email,
      totalAmount: order.totalAmount,
      products: order.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    console.log('Generated invoiceData:', JSON.stringify(invoiceData, null, 2));

    // Generate PDF
    const pdfBuffer = await renderToBuffer(<InvoiceTemplate order={invoiceData} />);

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as downloadable file
    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
