// scripts/migrate-medical-stock.js
// Run with: node scripts/migrate-medical-stock.js



import path from 'path';
import { fileURLToPath } from 'url';

async function migrateMedicalStock() {
  // Use dynamic import for ESM compatibility and resolve absolute paths
  const mongoose = await import('mongoose').then(m => m.default || m);
  const __filename = fileURLToPath(import.meta.url || require('url').pathToFileURL(__filename));
  const __dirname = path.dirname(__filename);
  const Product = await import(path.resolve(__dirname, '../src/models/Product.js')).then(m => m.default || m);
  const MedicalStock = await import(path.resolve(__dirname, '../src/models/MedicalStock.js')).then(m => m.default || m);
  const getCloudConnection = await import(path.resolve(__dirname, '../src/lib/mongodb-cloud.js')).then(m => m.getCloudConnection);

  await getCloudConnection();

  // 1. Get all animal_medicine products
  const products = await Product.find({ category: 'animal_medicine' });

  for (const product of products) {
    // 2. Find or create a MedicalStock doc for each product
    let stock = await MedicalStock.findOne({ productId: product._id.toString() });
    if (!stock) {
      // If no stock, create with quantity 0
      await MedicalStock.create({
        productId: product._id.toString(),
        productName: product.name,
        quantity: 0,
      });
      console.log(`Created MedicalStock for product: ${product.name}`);
    } else {
      // If stock exists, update to new structure
      stock.productId = product._id.toString();
      stock.productName = product.name;
      stock.quantity = typeof stock.quantity === 'number' ? stock.quantity : (Array.isArray(stock.units) ? stock.units.length : 0);
      await stock.save();
      console.log(`Updated MedicalStock for product: ${product.name}`);
    }
  }

  // 3. Remove any MedicalStock docs not linked to a valid product
  const validIds = products.map(p => p._id.toString());
  await MedicalStock.deleteMany({ productId: { $nin: validIds } });
  console.log('Removed orphaned MedicalStock documents.');

  mongoose.connection.close();
  console.log('Migration complete.');
}

migrateMedicalStock().catch(err => {
  console.error('Migration failed:', err);
  try { require('mongoose').connection.close(); } catch {}
});
