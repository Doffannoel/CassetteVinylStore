// Product types
export interface Product {
  _id: string;
  name: string;
  artist?: string;
  album?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: 'vinyl' | 'cd' | 'cassette';
  genre?: string;
  releaseYear?: number;
  label?: string;
  stock: number;
  isAvailable: boolean;
  status: 'for_sale' | 'in_collection' | 'sold';
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Order types
export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  name?: string;
  artist?: string;
  category?: 'vinyl' | 'cd' | 'cassette';
}

export interface Order {
  _id?: string;
  orderId: string;
  items: OrderItem[];
  customerInfo: CustomerInfo;
  totalAmount: number;
  status:
    | 'pending'
    | 'processing'
    | 'paid'
    | 'completed'
    | 'cancelled'
    | 'ready_pickup';
  paymentMethod?: string;
  paymentStatus?: string;
  midtransToken?: string;
  midtransRedirectUrl?: string;
  notes?: string;
  pickupCode?: string;
  createdAt?: Date;
  updatedAt?: Date;
  pickupStatus?: 'pending' | 'ready_pickup' | 'picked_up';
  pickedUpBy?: string;
  pickedUpAt?: Date;
}

// Customer types
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

// Admin types
export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  salesByMonth: {
    month: string;
    sales: number;
  }[];
  salesByCategory: {
    category: string;
    sales: number;
  }[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Filter and sorting
export interface ProductFilters {
  category?: 'vinyl' | 'cd' | 'cassette' | '';
  priceRange?: {
    min: number;
    max: number;
  };
  genre?: string;
  inStock?: boolean;
  search?: string;
}

export interface SortOption {
  field: 'price' | 'name' | 'releaseYear' | 'createdAt';
  order: 'asc' | 'desc';
}
