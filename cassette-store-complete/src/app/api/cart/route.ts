import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { verifyToken, JWTPayload } from '@/utils/auth';
import { cookies } from 'next/headers';

// GET - Fetch user's cart
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
const token = cookieStore.get('auth_token')?.value;
    const user = verifyToken<JWTPayload>(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await dbConnect();

    let cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ userId: user._id, items: [] });
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart or update quantity
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = verifyToken<JWTPayload>(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await req.json();

    if (!productId || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid product or quantity' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${product.stock} items available` },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: [{ productId, quantity }],
      });
    } else {
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.stock) {
          return NextResponse.json(
            { success: false, error: `Only ${product.stock} items available` },
            { status: 400 }
          );
        }

        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    // Populate and return updated cart
    await cart.populate('items.productId');

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Item added to cart',
    });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// PUT - Update cart item quantity
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
const token = cookieStore.get('auth_token')?.value;
    const user = verifyToken<JWTPayload>(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { productId, quantity } = await req.json();

    if (!productId || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product or quantity' },
        { status: 400 }
      );
    }

    await dbConnect();

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      );
    } else {
      // Check product stock
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      if (quantity > product.stock) {
        return NextResponse.json(
          { success: false, error: `Only ${product.stock} items available` },
          { status: 400 }
        );
      }

      // Update quantity
      const itemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    await cart.save();
    await cart.populate('items.productId');

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Cart updated',
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart or clear cart
export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
const token = cookieStore.get('auth_token')?.value;
    const user = verifyToken<JWTPayload>(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    await dbConnect();

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (productId) {
      // Remove specific item
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId
      );
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();
    await cart.populate('items.productId');

    return NextResponse.json({
      success: true,
      data: cart,
      message: productId ? 'Item removed from cart' : 'Cart cleared',
    });
  } catch (error: any) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove item' },
      { status: 500 }
    );
  }
}