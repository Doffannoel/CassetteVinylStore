import { NextRequest, NextResponse } from 'next/server';
import Product from '@/models/Product';
import connectDB from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'No items provided for stock update' }, { status: 400 });
    }

    const updatePromises = items.map(async (item: any) => {
      const { productId, quantity } = item;
      if (!productId || !quantity || quantity <= 0) {
        console.warn('Invalid item in stock update request:', item);
        return null; // Skip invalid items
      }

      const product = await Product.findById(productId);

      if (!product) {
        console.warn(`Product with ID ${productId} not found.`);
        return null; // Product not found
      }

      if (product.stock < quantity) {
        // This scenario should ideally be prevented at checkout, but handle defensively
        console.error(`Insufficient stock for product ${product.name} (ID: ${productId}).`);
        return null;
      }

      product.stock -= quantity;
      product.soldCount += quantity;

      if (product.stock <= 0) {
        product.status = 'sold';
        product.isAvailable = false;
      }

      await product.save();
      return product;
    });

    const updatedProducts = await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Stock updated successfully', updatedProducts }, { status: 200 });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
