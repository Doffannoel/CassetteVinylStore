import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  artist: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  images: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: true,
    enum: ['vinyl', 'cd', 'cassette'],
    lowercase: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  releaseYear: {
    type: Number,
    min: [1900, 'Invalid release year'],
    max: [new Date().getFullYear(), 'Release year cannot be in the future'],
  },
  label: {
    type: String,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ProductSchema.index({ name: 'text', artist: 'text', description: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ stock: 1 });

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.stock > 0 && this.isAvailable;
});

// Method to reduce stock after purchase
ProductSchema.methods.reduceStock = async function(quantity: number) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  this.soldCount += quantity;
  return this.save();
};

// Static method to get featured products
ProductSchema.statics.getFeatured = function() {
  return this.find({ featured: true, isAvailable: true, stock: { $gt: 0 } })
    .sort('-createdAt')
    .limit(8);
};

// Static method to get low stock products
ProductSchema.statics.getLowStock = function(threshold = 5) {
  return this.find({ stock: { $lte: threshold, $gt: 0 }, isAvailable: true })
    .sort('stock');
};

const Product = models.Product || model('Product', ProductSchema);

export default Product;
