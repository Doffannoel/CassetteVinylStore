require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    artist: String,
    album: String,
    price: Number,
    originalPrice: Number,
    images: [String],
    description: String,
    category: String,
    genre: String,
    releaseYear: Number,
    label: String,
    stock: Number,
    isAvailable: Boolean,
    status: String,
    featured: Boolean,
    soldCount: Number,
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

async function checkProducts() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb+srv://cassette-admin:PbWLXN4C9mi9VyRC@cassette-admin.hhq74yb.mongodb.net/cassette-store?retryWrites=true&w=majority'
    );

    const total = await Product.countDocuments();
    const available = await Product.countDocuments({ isAvailable: true });
    const inStock = await Product.countDocuments({ stock: { $gt: 0 } });
    const forSale = await Product.countDocuments({ status: 'for_sale' });
    const inCollection = await Product.countDocuments({ status: 'in_collection' });
    const sold = await Product.countDocuments({ status: 'sold' });

    console.log('Total products:', total);
    console.log('Available (isAvailable: true):', available);
    console.log('In stock (stock > 0):', inStock);
    console.log('For sale:', forSale);
    console.log('In collection:', inCollection);
    console.log('Sold:', sold);

    // Sample some available products
    const sampleAvailable = await Product.find({ isAvailable: true }).limit(5);
    console.log('\nSample available products:');
    sampleAvailable.forEach((p) =>
      console.log('-', p.name, '(', p.category, ')', 'stock:', p.stock, 'status:', p.status)
    );

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();
