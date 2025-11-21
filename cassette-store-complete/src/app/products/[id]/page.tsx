'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import useCartStore from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  ChevronLeft,
  Loader2,
  Music,
  Disc,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  LogIn,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        fetchRelatedProducts(data.data.category, productId);
      } else {
        toast.error('Product not found');
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, currentProductId: string) => {
    try {
      const response = await fetch(`/api/products?category=${category}&limit=4`);
      const data = await response.json();

      if (data.success) {
        const filtered = data.data.products.filter((p: Product) => p._id !== currentProductId);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    try {
      await addItem(product, quantity);
      toast.success(`${quantity} × ${product.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-xl">Product not found</p>
        <button onClick={() => router.push('/products')} className="btn-primary mt-4">
          Back to Products
        </button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container py-8">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <LogIn className="text-accent-gold" size={24} />
              <h3 className="text-xl font-heading">Login Required</h3>
            </div>
            <p className="text-text-body mb-6">
              You need to login to add items to your cart. Your cart will be saved and synced across
              devices.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const currentPath = window.location.pathname;
                  router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
                }}
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-6 py-3 border border-neutral-divider hover:bg-neutral-card transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-body mb-6">
        <button onClick={() => router.push('/products')} className="hover:text-accent-gold">
          Products
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/products?category=${product.category}`)}
          className="hover:text-accent-gold capitalize"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-text-primary">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Images */}
        <div>
          <div className="mb-4">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-neutral-card flex items-center justify-center">
                <Music size={64} className="text-neutral-divider" />
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 flex-shrink-0 border-2 ${
                    selectedImage === index ? 'border-accent-gold' : 'border-neutral-divider'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category & Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="badge bg-text-primary text-white capitalize">{product.category}</span>
            {product.featured && <span className="badge bg-accent-gold text-white">Featured</span>}
            {discount > 0 && <span className="badge bg-red-500 text-white">-{discount}%</span>}
          </div>

          {/* Artist */}
          {product.artist && product.artist !== product.name && (
            <p className="text-sm text-text-body uppercase tracking-wider mb-2">{product.artist}</p>
          )}

          {/* Name */}
          <h1 className="text-3xl font-heading mb-4">{product.name}</h1>

          {/* Additional Info */}
          <div className="flex flex-wrap gap-4 text-sm text-text-body mb-6">
            {product.releaseYear && (
              <div className="flex items-center gap-1">
                <Disc size={16} />
                <span>Released: {product.releaseYear}</span>
              </div>
            )}
            {product.genre && (
              <div className="flex items-center gap-1">
                <Music size={16} />
                <span>{product.genre}</span>
              </div>
            )}
            {product.label && (
              <div className="flex items-center gap-1">
                <span>Label: {product.label}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.status === 'for_sale' ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-accent-gold">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-text-body line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-text-body">
                {product.status === 'in_collection' ? 'Only For Display' : 'Sold'}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 && product.status === 'for_sale' ? (
              <p className={`text-sm ${product.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                {product.stock <= 5
                  ? `Only ${product.stock} left in stock!`
                  : `${product.stock} items in stock`}
              </p>
            ) : product.status === 'for_sale' && product.stock === 0 ? (
              <p className="text-red-600 font-semibold">Out of stock</p>
            ) : null}
          </div>

          {/* Auth Warning for Guest Users */}
          {!isAuthenticated && product.status === 'for_sale' && product.stock > 0 && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex items-start gap-2">
                <LogIn className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-blue-800 font-semibold">Login to add to cart</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your cart will be saved and synced across all your devices
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {product.status === 'for_sale' ? (
            product.stock > 0 ? (
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border border-neutral-divider">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-neutral-card"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-16 text-center py-2"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-neutral-card"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <button
                  disabled
                  className="btn-disabled w-full flex items-center justify-center gap-2"
                >
                  Out of Stock
                </button>
              </div>
            )
          ) : product.status === 'in_collection' ? (
            <div className="mb-6">
              <button
                disabled
                className="bg-accent-gold text-white px-6 py-3 rounded-none transition-all uppercase tracking-wider font-semibold w-full flex items-center justify-center gap-2"
              >
                Display Product is not for sale
              </button>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex items-center gap-2 text-text-body hover:text-accent-gold">
              <Heart size={20} />
              <span>Add to Wishlist</span>
            </button>
            <button className="flex items-center gap-2 text-text-body hover:text-accent-gold">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>

          {/* Description */}
          <div className="border-t border-neutral-divider pt-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-text-body whitespace-pre-line">{product.description}</p>
          </div>

          {/* Shipping Info */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3">
              {/* <Truck size={20} className="text-accent-gold" />
              <span className="text-sm">Free shipping on orders above Rp 500.000</span> */}
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-accent-gold" />
              <span className="text-sm">100% authentic products guaranteed</span>
            </div>
            <div className="flex items-center gap-3">
              {/* <RotateCcw size={20} className="text-accent-gold" />
              <span className="text-sm">14-day return policy</span> */}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-heading mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
