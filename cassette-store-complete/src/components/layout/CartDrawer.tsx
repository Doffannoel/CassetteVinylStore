'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag, Music, LogIn } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';

const CartDrawer = () => {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalAmount, clearCart } =
    useCartStore();
  const { isAuthenticated, user, isLoading } = useAuth();
  const totalAmount = getTotalAmount();

  useEffect(() => {
    console.log('🔐 Auth State:', { isAuthenticated, user, isLoading });
  }, [isAuthenticated, user, isLoading]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleCart} />}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-divider">
          <h2 className="text-xl font-heading">Shopping Cart ({items.length})</h2>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-neutral-card rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Not Authenticated Warning */}
        {!isAuthenticated && items.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-4">
            <div className="flex items-start gap-3">
              <LogIn className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Login Required</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Please login to save your cart and proceed with checkout.
                </p>
                <Link
                  href={`/login`}
                  onClick={toggleCart}
                  className="inline-block bg-amber-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  Login Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag size={48} className="text-neutral-divider mb-4" />
              <p className="text-text-body mb-2">Your cart is empty</p>

              {!isAuthenticated && (
                <div className="text-center mt-4 px-6">
                  <p className="text-sm text-text-body mb-3">
                    Login to save your items and checkout faster
                  </p>
                  <Link
                    href={`/login`}
                    onClick={toggleCart}
                    className="inline-flex items-center gap-2 bg-accent-gold text-white px-6 py-2 rounded hover:bg-accent-gold/90 transition-colors"
                  >
                    <LogIn size={18} />
                    Login
                  </Link>
                </div>
              )}

              <button onClick={toggleCart} className="btn-primary mt-6">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex gap-4 pb-4 border-b border-neutral-divider"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-neutral-card flex-shrink-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={24} className="text-neutral-divider" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{item.product.name}</h3>
                    {item.product.artist && (
                      <p className="text-sm text-text-body">{item.product.artist}</p>
                    )}
                    <p className="text-sm text-text-body capitalize">{item.product.category}</p>
                    <p className="font-semibold text-accent-gold mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-1 hover:bg-neutral-card rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 bg-neutral-card min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="p-1 hover:bg-neutral-card rounded"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="ml-auto text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-divider p-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-bold text-accent-gold">{formatPrice(totalAmount)}</span>
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="btn-primary w-full text-center block"
                >
                  Checkout
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="w-full mt-2 text-sm text-red-600 hover:underline"
                >
                  Clear Cart
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href={`/login`}
                  onClick={toggleCart}
                  className="btn-primary w-full text-center block"
                >
                  Login to Checkout
                </Link>
                <p className="text-xs text-center text-text-body">
                  Your items will be saved after login
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;