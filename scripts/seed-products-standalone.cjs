// Standalone script to seed animal feed products to the cloud database
// Usage: node scripts/seed-products-standalone.cjs

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_CLOUD_CLUSTER_URI || process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['animal_feed', 'animal_medicine'], required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const products = [
    {
    name: "Wheat Bran – نخالة",
    category: "animal_feed",
    description: "The outer layer of wheat, rich in fiber and moderate protein. Commonly used to balance animal diets and improve digestion."
  },
  {
    name: 'Chair Mchared – شعير مشرّد',
    category: 'animal_feed',
    description: 'Barley feed, often given crushed or split. Provides carbohydrates and energy, commonly used for fattening and general livestock nutrition.'
  },
  {
    name: "Beet Pulp – تفل الشمندر",
    category: "animal_feed",
    description: "A by-product of sugar beet processing. High in digestible fiber and energy, often used to boost weight gain in animals."
  },
  {
    name: 'Corn – ذرة',
    category: 'animal_feed',
    description: 'A common grain feed, rich in starch and energy. Improves weight gain and is widely used in livestock rations.'
  },
  {
    name: 'Alf Sahil – علف ساحل',
    category: 'animal_feed',
    description: 'Alfalfa, a protein-rich forage crop. Used as a supplement to boost growth, milk production, and animal health. Sahil is a common Moroccan brand that offers alfalfa-based products in bales or pellets.'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    for (const prod of products) {
      await Product.updateOne(
        { name: prod.name, category: prod.category },
        { $setOnInsert: prod },
        { upsert: true }
      );
      console.log(`Seeded: ${prod.name}`);
    }
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
