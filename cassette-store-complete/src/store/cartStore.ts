import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types';
import toast from 'react-hot-toast';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isSyncing: boolean;
  isAuthenticated: boolean;

  // Actions
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  syncWithBackend: () => Promise<void>;
  setAuthenticated: (isAuth: boolean) => void;
  loadCartFromBackend: () => Promise<void>;

  // Computed
  getTotalItems: () => number;
  getTotalAmount: () => number;
  getItemQuantity: (productId: string) => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,
      isAuthenticated: false,

      setAuthenticated: (isAuth: boolean) => {
        set({ isAuthenticated: isAuth });
        if (isAuth) {
          // Load cart from backend when authenticated
          get().loadCartFromBackend();
        }
      },

      loadCartFromBackend: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        try {
          const response = await fetch('/api/cart');
          const data = await response.json();

          if (data.success && data.data) {
            // Transform backend cart to store format
            const backendItems: CartItem[] = data.data.items.map((item: any) => ({
              product: item.productId,
              quantity: item.quantity,
            }));

            set({ items: backendItems });
          }
        } catch (error) {
          console.error('Failed to load cart from backend:', error);
        }
      },

      syncWithBackend: async () => {
        const { isAuthenticated, items } = get();
        if (!isAuthenticated || items.length === 0) return;

        set({ isSyncing: true });

        try {
          // Sync all items to backend
          for (const item of items) {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: item.product._id,
                quantity: item.quantity,
              }),
            });
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      addItem: async (product: Product, quantity = 1) => {
        const { isAuthenticated } = get();

        // For authenticated users, add to backend first
        if (isAuthenticated) {
          try {
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product._id,
                quantity,
              }),
            });

            const data = await response.json();

            if (!data.success) {
              toast.error(data.error || 'Failed to add item to cart');
              return;
            }

            // Update local state from backend response
            if (data.data && data.data.items) {
              const backendItems: CartItem[] = data.data.items.map((item: any) => ({
                product: item.productId,
                quantity: item.quantity,
              }));
              set({ items: backendItems });
            }
          } catch (error) {
            console.error('Failed to add item:', error);
            toast.error('Failed to add item to cart');
            return;
          }
        } else {
          // For guests, add to local storage only
          set((state) => {
            const existingItem = state.items.find(
              (item) => item.product._id === product._id
            );

            if (existingItem) {
              return {
                items: state.items.map((item) =>
                  item.product._id === product._id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
              };
            }

            return {
              items: [...state.items, { product, quantity }],
            };
          });
        }
      },

      removeItem: async (productId: string) => {
        const { isAuthenticated } = get();

        if (isAuthenticated) {
          try {
            const response = await fetch(`/api/cart?productId=${productId}`, {
              method: 'DELETE',
            });

            const data = await response.json();

            if (data.success && data.data) {
              const backendItems: CartItem[] = data.data.items.map((item: any) => ({
                product: item.productId,
                quantity: item.quantity,
              }));
              set({ items: backendItems });
            }
          } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item');
          }
        } else {
          set((state) => ({
            items: state.items.filter((item) => item.product._id !== productId),
          }));
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { isAuthenticated } = get();

        if (isAuthenticated) {
          try {
            const response = await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, quantity }),
            });

            const data = await response.json();

            if (!data.success) {
              toast.error(data.error || 'Failed to update quantity');
              return;
            }

            if (data.data && data.data.items) {
              const backendItems: CartItem[] = data.data.items.map((item: any) => ({
                product: item.productId,
                quantity: item.quantity,
              }));
              set({ items: backendItems });
            }
          } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity');
          }
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.product._id === productId ? { ...item, quantity } : item
            ),
          }));
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = get();

        if (isAuthenticated) {
          try {
            await fetch('/api/cart', {
              method: 'DELETE',
            });
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        }

        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getTotalItems: () => {
        const { items } = get();
        return (items || []).reduce((total, item) => total + (item.quantity || 0), 0);
      },

      getTotalAmount: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemQuantity: (productId: string) => {
        const state = get();
        const item = state.items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cassette-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

export default useCartStore;