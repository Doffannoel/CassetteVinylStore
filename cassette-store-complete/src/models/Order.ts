import mongoose, { Schema, model, models } from 'mongoose';

const CustomerInfoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  name: String,
  artist: String,
  category: String,
}, { _id: false });

const OrderSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: [arrayMinLength, 'Order must have at least one item'],
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  midtransToken: String,
  midtransRedirectUrl: String,
  midtransTransactionId: String,
  notes: String,
  trackingNumber: String,
  shippedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
}, {
  timestamps: true,
});

function arrayMinLength(val: any[]) {
  return val.length > 0;
}

// Indexes
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ paymentStatus: 1 });

// Generate unique order ID
OrderSchema.statics.generateOrderId = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// Get orders by status
OrderSchema.statics.getByStatus = function(status: string) {
  return this.find({ status })
    .populate('items.product')
    .sort('-createdAt');
};

// Get recent orders
OrderSchema.statics.getRecent = function(limit = 10) {
  return this.find()
    .populate('items.product')
    .sort('-createdAt')
    .limit(limit);
};

// Calculate sales statistics
OrderSchema.statics.getSalesStats = async function() {
  const stats = await this.aggregate([
    { $match: { status: { $in: ['paid', 'shipped', 'completed'] } } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' },
      },
    },
  ]);

  return stats[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
};

// Get sales by month
OrderSchema.statics.getSalesByMonth = async function(year: number) {
  const sales = await this.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'completed'] },
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        sales: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Format result with month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return sales.map(item => ({
    month: monthNames[item._id - 1],
    sales: item.sales,
    orders: item.orders,
  }));
};

// Method to update order status
OrderSchema.methods.updateStatus = async function(newStatus: string) {
  this.status = newStatus;
  
  if (newStatus === 'shipped') {
    this.shippedAt = new Date();
  } else if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

const Order = models.Order || model('Order', OrderSchema);

export default Order;
