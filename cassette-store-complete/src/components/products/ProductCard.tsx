'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Music, Heart } from 'lucide-react';
import { Product } from '@/types';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${product._id}`}>
      <div
        className="product-card group cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-neutral-card overflow-hidden">
          {product.images?.[0] && !imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music size={48} className="text-neutral-divider" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && <span className="badge bg-accent-gold text-white">Featured</span>}
            {product.status !== 'for_sale' && (
              <span className="badge bg-blue-500 text-white">
                {product.status === 'in_collection' ? 'In Collection' : 'Sold'}
              </span>
            )}
            {discount > 0 && <span className="badge bg-red-500 text-white">-{discount}%</span>}
            {product.stock === 0 && (
              <span className="badge bg-gray-500 text-white">Out of Stock</span>
            )}
          </div>

          {/* Category Badge */}
          <div className="absolute top-2 right-2">
            <span className="badge bg-text-primary text-white capitalize">{product.category}</span>
          </div>

          {/* Hover Actions */}
          {isHovered && product.stock > 0 && product.status === 'for_sale' && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <button
                onClick={handleAddToCart}
                className="w-full bg-accent-gold text-white py-2 flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors"
              >
                <ShoppingBag size={18} />
                <span className="uppercase text-sm font-semibold tracking-wider">Add to Cart</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Artist */}
          {product.artist && (
            <p className="text-xs text-text-body uppercase tracking-wider mb-1">{product.artist}</p>
          )}

          {/* Label */}
          {product.label && (
            <p className="text-xs text-text-body uppercase tracking-wider mb-1">{product.label}</p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">{product.name}</h3>

          {/* Additional Info */}
          <div className="flex items-center gap-2 text-xs text-text-body mb-2">
            {product.releaseYear && <span>{product.releaseYear}</span>}
            {product.genre && (
              <>
                <span>•</span>
                <span>{product.genre}</span>
              </>
            )}
          </div>

          {/* Price */}
          {product.status === 'for_sale' && (
            <div className="flex items-center gap-2">
              {product.price ? (
                <>
                  <span className="text-lg font-bold text-accent-gold">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-text-body line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-text-body">Price not available</span>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-2">
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs text-orange-600">Only {product.stock} left in stock!</p>
            )}
            {product.stock === 0 && <p className="text-xs text-red-600">Out of stock</p>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
