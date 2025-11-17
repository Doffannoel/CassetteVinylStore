'use client';

import AdminOrderList from '@/components/admin/AdminOrderList';
import AdminProductList from '@/components/admin/AdminProductList';
import ProductForm from '@/components/admin/ProductForm';
import AdminStats from '@/components/admin/AdminStats';
import AdminPickup from '@/components/admin/AdminPickup';

import { useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'products', 'orders', 'addProduct'

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 uppercase tracking-wider">Admin Dashboard</h1>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('stats')}
            className={`${activeTab === 'stats'
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${activeTab === 'products'
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${activeTab === 'orders'
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={`${activeTab === 'pickup'
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors`}
          >
            Pickup Code
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'products' && <AdminProductList />}
        {activeTab === 'orders' && <AdminOrderList />}
        {activeTab === 'pickup' && <AdminPickup />}
      </div>
    </div>
  );
}