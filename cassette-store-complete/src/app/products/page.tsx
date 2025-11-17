'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Product } from '@/types';
import { Loader2, Grid, List } from 'lucide-react';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    setPagination(p => ({ ...p, currentPage: page }));
    fetchProducts(page);
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    // The router push will trigger the useEffect
    window.history.pushState(null, '', `?${params.toString()}`);
    // We need to manually trigger a re-render as pushState doesn't
    fetchProducts(newPage);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64">
          <ProductFilters />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading">Products</h1>
              <p className="text-text-body">
                {pagination.totalCount} products found
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'text-accent-gold' : 'text-text-body'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'text-accent-gold' : 'text-text-body'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-text-body">No products found</p>
              <p className="text-text-body mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="btn-secondary px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 ${
                            pagination.currentPage === page
                              ? 'bg-accent-gold text-white'
                              : 'bg-neutral-card hover:bg-neutral-divider'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="btn-secondary px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
