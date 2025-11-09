'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, Music } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import CartDrawer from './CartDrawer';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const { getTotalItems, toggleCart } = useCartStore();
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setMounted(true);
    setTotalItems(getTotalItems());
  }, [getTotalItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary-bg border-b border-neutral-divider">
        {/* Main Header */}
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-text-primary"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-8 w-8 text-accent-gold" />
              <div>
                <h1 className="text-2xl font-heading text-text-primary">CASSETTE STORE</h1>
                <p className="text-xs text-text-body uppercase tracking-wider">EST. 1946</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/products?category=vinyl"
                className="uppercase text-sm font-semibold tracking-wider hover:text-accent-gold transition-colors"
              >
                Vinyl
              </Link>
              <Link
                href="/products?category=cd"
                className="uppercase text-sm font-semibold tracking-wider hover:text-accent-gold transition-colors"
              >
                CD
              </Link>
              <Link
                href="/products?category=cassette"
                className="uppercase text-sm font-semibold tracking-wider hover:text-accent-gold transition-colors"
              >
                Cassette
              </Link>
              <Link
                href="/products"
                className="uppercase text-sm font-semibold tracking-wider hover:text-accent-gold transition-colors"
              >
                All Products
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-text-primary hover:text-accent-gold transition-colors"
              >
                <Search size={20} />
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-text-primary hover:text-accent-gold transition-colors"
              >
                <ShoppingBag size={20} />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="py-4 border-t border-neutral-divider">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for vinyl, CD, cassette..."
                  className="flex-1 input-field"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-8">
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-neutral-divider">
            <nav className="container py-4 space-y-2">
              <Link
                href="/products?category=vinyl"
                className="block py-2 uppercase text-sm font-semibold tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                Vinyl
              </Link>
              <Link
                href="/products?category=cd"
                className="block py-2 uppercase text-sm font-semibold tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                CD
              </Link>
              <Link
                href="/products?category=cassette"
                className="block py-2 uppercase text-sm font-semibold tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                Cassette
              </Link>
              <Link
                href="/products"
                className="block py-2 uppercase text-sm font-semibold tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
};

export default Header;
