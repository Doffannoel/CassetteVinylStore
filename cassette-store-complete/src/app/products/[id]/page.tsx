'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/types';
import useCartStore from '@/store/cartStore';
import { ShoppingBag, ChevronLeft, Loader2, Music, Disc, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

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

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
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
            <span className="badge bg-text-primary text-white capitalize">
              {product.category}
            </span>
            {product.featured && (
              <span className="badge bg-accent-gold text-white">
                Featured
              </span>
            )}
            {discount > 0 && (
              <span className="badge bg-red-500 text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Artist */}
          {product.artist && product.artist !== product.name && (
            <p className="text-sm text-text-body uppercase tracking-wider mb-2">
              {product.artist}
            </p>
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
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className={`text-sm ${product.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                {product.stock <= 5 
                  ? `Only ${product.stock} left in stock!` 
                  : `${product.stock} items in stock`
                }
              </p>
            ) : (
              <p className="text-red-600 font-semibold">Out of stock</p>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
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
                  onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
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
                Add to Cart
              </button>
            </div>
          )}

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
              <Truck size={20} className="text-accent-gold" />
              <span className="text-sm">Free shipping on orders above Rp 500.000</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-accent-gold" />
              <span className="text-sm">100% authentic products guaranteed</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className="text-accent-gold" />
              <span className="text-sm">14-day return policy</span>
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
