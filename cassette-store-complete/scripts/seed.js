// Run this script with: node scripts/seed.js
// Make sure to update your MONGODB_URI in the script

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// MongoDB connection string - UPDATE THIS!
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://cassette-admin:PbWLXN4C9mi9VyRC@cassette-admin.hhq74yb.mongodb.net/cassette-store?retryWrites=true&w=majority';

// Ensure database name is included
const finalMONGODB_URI = MONGODB_URI.includes('/cassette-store')
  ? MONGODB_URI
  : MONGODB_URI.replace('/?', '/cassette-store?');

// Product Schema
const ProductSchema = new mongoose.Schema(
  {
    name: String,
    artist: String,
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
    featured: Boolean,
    soldCount: Number,
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);

// Sample products data
const sampleProducts = [
  // VINYL
  {
    name: 'The Dark Side of the Moon',
    artist: 'Pink Floyd',
    price: 750000,
    originalPrice: 850000,
    images: ['https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=500'],
    description:
      'The Dark Side of the Moon is the eighth studio album by the English rock band Pink Floyd. One of the best-selling albums of all time.',
    category: 'vinyl',
    genre: 'Progressive Rock',
    releaseYear: 1973,
    label: 'Harvest Records',
    stock: 15,
    isAvailable: true,
    featured: true,
    soldCount: 45,
  },
  {
    name: 'Abbey Road',
    artist: 'The Beatles',
    price: 680000,
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'],
    description:
      'Abbey Road is the eleventh studio album by the English rock band the Beatles. The last album recorded by the band.',
    category: 'vinyl',
    genre: 'Rock',
    releaseYear: 1969,
    label: 'Apple Records',
    stock: 8,
    isAvailable: true,
    featured: true,
    soldCount: 32,
  },
  {
    name: 'Rumours',
    artist: 'Fleetwood Mac',
    price: 620000,
    originalPrice: 720000,
    images: ['https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500'],
    description:
      'Rumours is the eleventh studio album by British-American rock band Fleetwood Mac. One of the best-selling albums of all time.',
    category: 'vinyl',
    genre: 'Rock',
    releaseYear: 1977,
    label: 'Warner Bros',
    stock: 12,
    isAvailable: true,
    featured: false,
    soldCount: 28,
  },
  {
    name: 'Kind of Blue',
    artist: 'Miles Davis',
    price: 580000,
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'],
    description:
      'Kind of Blue is a studio album by American jazz trumpeter Miles Davis. Regarded as one of the greatest jazz albums of all time.',
    category: 'vinyl',
    genre: 'Jazz',
    releaseYear: 1959,
    label: 'Columbia Records',
    stock: 6,
    isAvailable: true,
    featured: true,
    soldCount: 18,
  },
  {
    name: 'Thriller',
    artist: 'Michael Jackson',
    price: 720000,
    originalPrice: 820000,
    images: ['https://images.unsplash.com/photo-1619983081593-e2ba5b543168?w=500'],
    description:
      'Thriller is the sixth studio album by Michael Jackson. It is the best-selling album of all time.',
    category: 'vinyl',
    genre: 'Pop',
    releaseYear: 1982,
    label: 'Epic Records',
    stock: 20,
    isAvailable: true,
    featured: true,
    soldCount: 67,
  },

  // CDs
  {
    name: 'OK Computer',
    artist: 'Radiohead',
    price: 280000,
    images: ['https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=500'],
    description:
      'OK Computer is the third studio album by English rock band Radiohead. A landmark album of the 1990s.',
    category: 'cd',
    genre: 'Alternative Rock',
    releaseYear: 1997,
    label: 'Parlophone',
    stock: 25,
    isAvailable: true,
    featured: true,
    soldCount: 42,
  },
  {
    name: 'Nevermind',
    artist: 'Nirvana',
    price: 250000,
    originalPrice: 300000,
    images: ['https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=500'],
    description:
      'Nevermind is the second studio album by American rock band Nirvana. It brought alternative rock to mainstream.',
    category: 'cd',
    genre: 'Grunge',
    releaseYear: 1991,
    label: 'DGC Records',
    stock: 18,
    isAvailable: true,
    featured: false,
    soldCount: 55,
  },
  {
    name: 'The Miseducation of Lauryn Hill',
    artist: 'Lauryn Hill',
    price: 220000,
    images: ['https://images.unsplash.com/photo-1611001708825-8a58051508da?w=500'],
    description:
      'The debut solo album by American singer Lauryn Hill. A neo soul and R&B masterpiece.',
    category: 'cd',
    genre: 'R&B',
    releaseYear: 1998,
    label: 'Ruffhouse Records',
    stock: 14,
    isAvailable: true,
    featured: true,
    soldCount: 31,
  },
  {
    name: 'In Rainbows',
    artist: 'Radiohead',
    price: 260000,
    images: ['https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=500'],
    description:
      'In Rainbows is the seventh studio album by Radiohead. Initially released as a pay-what-you-want download.',
    category: 'cd',
    genre: 'Alternative Rock',
    releaseYear: 2007,
    label: 'Self-released',
    stock: 10,
    isAvailable: true,
    featured: false,
    soldCount: 24,
  },
  {
    name: 'Random Access Memories',
    artist: 'Daft Punk',
    price: 290000,
    originalPrice: 340000,
    images: ['https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500'],
    description:
      'Random Access Memories is the fourth studio album by French electronic duo Daft Punk.',
    category: 'cd',
    genre: 'Electronic',
    releaseYear: 2013,
    label: 'Columbia Records',
    stock: 22,
    isAvailable: true,
    featured: true,
    soldCount: 38,
  },

  // CASSETTES
  {
    name: 'Purple Rain',
    artist: 'Prince',
    price: 180000,
    images: ['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500'],
    description:
      'Purple Rain is the sixth studio album by Prince. The soundtrack to the film of the same name.',
    category: 'cassette',
    genre: 'Pop/Rock',
    releaseYear: 1984,
    label: 'Warner Bros',
    stock: 8,
    isAvailable: true,
    featured: true,
    soldCount: 19,
  },
  {
    name: 'Like a Virgin',
    artist: 'Madonna',
    price: 150000,
    originalPrice: 180000,
    images: ['https://images.unsplash.com/photo-1602848597941-0d3d3a2c15b7?w=500'],
    description:
      'Like a Virgin is the second studio album by Madonna. It established her as a pop icon.',
    category: 'cassette',
    genre: 'Pop',
    releaseYear: 1984,
    label: 'Sire Records',
    stock: 5,
    isAvailable: true,
    featured: false,
    soldCount: 14,
  },
  {
    name: 'Appetite for Destruction',
    artist: "Guns N' Roses",
    price: 170000,
    images: ['https://images.unsplash.com/photo-1629276301820-0f3eedc29fd0?w=500'],
    description:
      "Appetite for Destruction is the debut studio album by Guns N' Roses. One of the best-selling debut albums.",
    category: 'cassette',
    genre: 'Hard Rock',
    releaseYear: 1987,
    label: 'Geffen Records',
    stock: 7,
    isAvailable: true,
    featured: false,
    soldCount: 21,
  },
  {
    name: 'The Joshua Tree',
    artist: 'U2',
    price: 160000,
    images: ['https://images.unsplash.com/photo-1626366797918-87261db50d24?w=500'],
    description:
      'The Joshua Tree is the fifth studio album by Irish rock band U2. Their breakthrough album.',
    category: 'cassette',
    genre: 'Rock',
    releaseYear: 1987,
    label: 'Island Records',
    stock: 3,
    isAvailable: true,
    featured: true,
    soldCount: 16,
  },
  {
    name: 'Back in Black',
    artist: 'AC/DC',
    price: 175000,
    originalPrice: 200000,
    images: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500'],
    description:
      'Back in Black is the seventh studio album by AC/DC. One of the best-selling albums worldwide.',
    category: 'cassette',
    genre: 'Hard Rock',
    releaseYear: 1980,
    label: 'Atlantic Records',
    stock: 9,
    isAvailable: true,
    featured: false,
    soldCount: 25,
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(finalMONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${products.length} products`);

    // Display inserted products
    console.log('\n📦 Inserted Products:');
    products.forEach((product) => {
      console.log(`- ${product.name} by ${product.artist} (${product.category})`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
