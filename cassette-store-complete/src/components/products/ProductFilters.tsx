'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

const ProductFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = [
    { value: 'vinyl', label: 'Vinyl' },
    { value: 'cd', label: 'CD' },
    { value: 'cassette', label: 'Cassette' },
  ];

  const priceRanges = [
    { value: '0-100000', label: 'Under Rp 100.000' },
    { value: '100000-300000', label: 'Rp 100.000 - Rp 300.000' },
    { value: '300000-500000', label: 'Rp 300.000 - Rp 500.000' },
    { value: '500000-1000000', label: 'Rp 500.000 - Rp 1.000.000' },
    { value: '1000000', label: 'Above Rp 1.000.000' },
  ];

  const genres = [
    'Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 
    'Hip Hop', 'R&B', 'Country', 'Folk', 'Indie'
  ];

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = () => {
    const params = searchParams.toString();
    return params && params !== 'page=1';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading flex items-center gap-2">
          <Filter size={20} />
          Filters
        </h2>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3 uppercase text-sm tracking-wider">Category</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={searchParams.get('category') === category.value}
                onChange={(e) => updateFilter('category', e.target.checked ? category.value : '')}
                className="text-accent-gold focus:ring-accent-gold"
              />
              <span className="text-sm">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold mb-3 uppercase text-sm tracking-wider">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map(range => {
            const [min, max] = range.value.split('-');
            return (
              <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  checked={
                    searchParams.get('minPrice') === min && 
                    (max ? searchParams.get('maxPrice') === max : !searchParams.get('maxPrice'))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const params = new URLSearchParams(searchParams.toString());
                      if (min) params.set('minPrice', min);
                      if (max) {
                        params.set('maxPrice', max);
                      } else {
                        params.delete('maxPrice');
                      }
                      params.set('page', '1');
                      router.push(`/products?${params.toString()}`);
                    }
                  }}
                  className="text-accent-gold focus:ring-accent-gold"
                />
                <span className="text-sm">{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Genre Filter */}
      <div>
        <h3 className="font-semibold mb-3 uppercase text-sm tracking-wider">Genre</h3>
        <select
          value={searchParams.get('genre') || ''}
          onChange={(e) => updateFilter('genre', e.target.value)}
          className="w-full input-field"
        >
          <option value="">All Genres</option>
          {genres.map(genre => (
            <option key={genre} value={genre.toLowerCase()}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get('inStock') === 'true'}
            onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
            className="text-accent-gold focus:ring-accent-gold"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="font-semibold mb-3 uppercase text-sm tracking-wider">Sort By</h3>
        <select
          value={searchParams.get('sort') || '-createdAt'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full input-field"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
          <option value="-name">Name: Z to A</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;
