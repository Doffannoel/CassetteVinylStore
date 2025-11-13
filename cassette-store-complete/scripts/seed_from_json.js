require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');

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
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    artist: {
      type: String,
      trim: true,
    },
    album: {
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
    images: [
      {
        type: String,
        required: true,
      },
    ],
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
    status: {
      type: String,
      enum: ['for_sale', 'in_collection', 'sold'],
      default: 'for_sale',
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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', ProductSchema);

// Function to map JSON data to Product schema
function mapJsonToProduct(jsonItem) {
  // Map category
  let category = 'cassette'; // default
  if (jsonItem.format && jsonItem.format.toLowerCase().includes('vinyl')) {
    category = 'vinyl';
  } else if (jsonItem.format && jsonItem.format.toLowerCase().includes('cd')) {
    category = 'cd';
  }

  // Map status
  let status = 'for_sale';
  if (jsonItem.status === 'In Collection') {
    status = 'in_collection';
  } else if (jsonItem.status === 'Sold') {
    status = 'sold';
  }

  // Map stock
  let stock = jsonItem.stock || 0;
  if (status === 'sold') {
    stock = 0;
  }

  // Map isAvailable
  let isAvailable = true;
  if (status === 'sold' || stock === 0) {
    isAvailable = false;
  }

  // Generate description if not present
  let description = `Album: ${jsonItem.album || 'Unknown'}`;
  if (jsonItem.artist) {
    description += ` by ${jsonItem.artist}`;
  }
  if (jsonItem.genre) {
    description += `. Genre: ${jsonItem.genre}`;
  }
  if (jsonItem.label) {
    description += `. Label: ${jsonItem.label}`;
  }
  if (jsonItem.release_year) {
    description += `. Released: ${jsonItem.release_year}`;
  }

  // Map price
  let price = jsonItem.price || null;
  if (price === null) {
    // Generate a random price based on category
    const basePrices = { vinyl: 500000, cd: 200000, cassette: 100000 };
    const basePrice = basePrices[category] || 100000;
    price = Math.floor(basePrice * (0.8 + Math.random() * 0.4)); // Random between 80%-120% of base
  }

  return {
    name: jsonItem.album || jsonItem.name || 'Unknown Album',
    artist: jsonItem.name || jsonItem.artist || null,
    album: jsonItem.album || null,
    price: price,
    images: jsonItem.image
      ? [jsonItem.image]
      : ['https://via.placeholder.com/500x500?text=No+Image'],
    description: description,
    category: category,
    genre: jsonItem.genre || null,
    releaseYear: jsonItem.release_year || null,
    label: jsonItem.label || null,
    stock: stock,
    isAvailable: isAvailable,
    status: status,
    featured: Math.random() < 0.1, // 10% chance to be featured
    soldCount: 0,
  };
}

// Seed function
async function seedFromJson() {
  try {
    // Connect to MongoDB
    await mongoose.connect(finalMONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read JSON file
    console.log('📖 Reading clean_client_albums.json...');
    const jsonData = JSON.parse(fs.readFileSync('../clean_client_albums.json', 'utf8'));
    console.log(`📊 Found ${jsonData.length} items in JSON file`);

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Map and validate products
    const productsToInsert = [];
    let skippedCount = 0;

    for (const item of jsonData) {
      try {
        const mappedProduct = mapJsonToProduct(item);

        // Basic validation
        if (!mappedProduct.name || !mappedProduct.price) {
          console.log(`⚠️  Skipping item: missing required fields`, item.album);
          skippedCount++;
          continue;
        }

        productsToInsert.push(mappedProduct);
      } catch (error) {
        console.log(`⚠️  Error mapping item:`, error.message);
        skippedCount++;
      }
    }

    console.log(`✅ Mapped ${productsToInsert.length} products (${skippedCount} skipped)`);

    // Insert products in batches to avoid memory issues
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      await Product.insertMany(batch);
      insertedCount += batch.length;
      console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} products`);
    }

    console.log(`\n🎉 Database seeded successfully!`);
    console.log(`📊 Total products inserted: ${insertedCount}`);
    console.log(`⚠️  Products skipped: ${skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedFromJson();
