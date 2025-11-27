'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, Music, User, LogOut } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import CartDrawer from './CartDrawer';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { toggleCart, setAuthenticated } = useCartStore();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync authentication state with cart store
  useEffect(() => {
    if (!isLoading) {
      setAuthenticated(isAuthenticated);
    }
  }, [isAuthenticated, isLoading, setAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await logout(); // ← Ini sudah call /api/auth/logout
    setShowUserMenu(false);
    // No need manual redirect, logout() dari AuthContext sudah handle
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
                <h1 className="text-2xl font-heading text-text-primary">Hysteria Music</h1>
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

              {/* User Menu */}
              {mounted && !isLoading && (
                <>
                  {isAuthenticated && user ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-2 text-text-primary hover:text-accent-gold transition-colors"
                      >
                        <User size={20} />
                        <span className="hidden md:inline text-sm">{user.name}</span>
                      </button>

                      {/* User Dropdown */}
                      {showUserMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowUserMenu(false)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-divider z-20">
                            <div className="p-3 border-b border-neutral-divider">
                              <p className="font-semibold text-sm">{user.name}</p>
                              <p className="text-xs text-text-body">{user.email}</p>
                            </div>
                            <div className="py-2">
                              {/* <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm hover:bg-neutral-card"
                                onClick={() => setShowUserMenu(false)}
                              >
                                My Profile
                              </Link> */}

                              <Link
                                href="/orders"
                                className="block px-4 py-2 text-sm hover:bg-neutral-card"
                                onClick={() => setShowUserMenu(false)}
                              >
                                My Orders
                              </Link>
                              {user.role === 'admin' && (
                                <Link
                                  href="/admin"
                                  className="block px-4 py-2 text-sm hover:bg-neutral-card text-accent-gold"
                                  onClick={() => setShowUserMenu(false)}
                                >
                                  Admin Dashboard
                                </Link>
                              )}
                            </div>
                            <div className="border-t border-neutral-divider">
                              <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-card flex items-center gap-2"
                              >
                                <LogOut size={16} />
                                Logout
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={`/login`}
                      className="p-2 text-text-primary hover:text-accent-gold transition-colors flex items-center gap-1"
                    >
                      <User size={20} />
                      <span className="hidden md:inline text-sm">Login</span>
                    </Link>
                  )}
                </>
              )}

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-text-primary hover:text-accent-gold transition-colors"
              >
                <ShoppingBag size={20} />
                {mounted && useCartStore.getState().getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-gold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {useCartStore.getState().getTotalItems()}
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

              {mounted && !isLoading && (
                <>
                  {isAuthenticated && user ? (
                    <>
                      <div className="pt-4 mt-4 border-t border-neutral-divider">
                        <p className="text-sm font-semibold mb-2">{user.name}</p>
                        <Link
                          href="/profile"
                          className="block py-2 text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="block py-2 text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block py-2 text-sm text-accent-gold"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="block py-2 text-sm text-red-600"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-4 mt-4 border-t border-neutral-divider">
                      <Link
                        href={`/login`}
                        className="block py-2 text-sm font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login / Register
                      </Link>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
};

export default Header;