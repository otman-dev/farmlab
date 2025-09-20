// Standalone script to seed medical stock for an existing animal medicine product
// Usage: node scripts/seed-medical-stock.cjs

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_CLOUD_CLUSTER_URI || process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['animal_feed', 'animal_medicine'], required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const medicineUnitSchema = new mongoose.Schema({
  openedAt: { type: Date },
  expiresAt: { type: Date, required: true },
});

const medicalStockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  units: { type: [medicineUnitSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const MedicalStock = mongoose.models.MedicalStock || mongoose.model('MedicalStock', medicalStockSchema);

async function seedMedicalStock() {
  try {
    await mongoose.connect(MONGODB_URI);
    const med = await Product.findOne({ category: 'animal_medicine' });
    if (!med) {
      console.log('No medical product found. Please add an animal_medicine product first.');
      process.exit(1);
    }
    const now = new Date();
    const units = [
      { expiresAt: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) }, // 1 month in future
      { expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) }  // 1 day in past (expired)
    ];
    const stock = await MedicalStock.create({ product: med._id, units });
    console.log('Seeded medical stock:', stock);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedMedicalStock();
