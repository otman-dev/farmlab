// Standalone script to seed food stock collection for animal feed products
// Usage: node scripts/seed-food-stock-standalone.cjs

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_CLOUD_CLUSTER_URI || process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['animal_feed', 'animal_medicine'], required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const foodStockUnitSchema = new mongoose.Schema({
  openedAt: { type: String },
});

const foodStockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  units: { type: [foodStockUnitSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const FoodStock = mongoose.models.FoodStock || mongoose.model('FoodStock', foodStockSchema);

async function seedFoodStock() {
  try {
    await mongoose.connect(MONGODB_URI);
    // Find an animal feed product
    const product = await Product.findOne({ category: 'animal_feed' });
    if (!product) {
      throw new Error('No animal_feed product found. Please seed products first.');
    }
    // Create a food stock entry with 5 units
    await FoodStock.deleteMany({ product: product._id });
    await FoodStock.create({
      product: product._id,
      units: [{}, {}, {}, {}, {}],
    });
    console.log(`Seeded food stock for: ${product.name}`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedFoodStock();
