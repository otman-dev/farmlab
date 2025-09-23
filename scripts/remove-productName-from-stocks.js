// scripts/remove-productName-from-stocks.js
// Run: node scripts/remove-productName-from-stocks.js
// This script removes the productName field from all FoodStock and MedicalStock documents

const mongoose = require('mongoose');

const uri = process.env.MONGODB_CLOUD_CLUSTER_URI;
if (!uri) throw new Error('Please set MONGODB_CLOUD_CLUSTER_URI in your environment');

(async () => {
  await mongoose.connect(uri);
  const foodResult = await mongoose.connection.collection('foodstocks').updateMany(
    { productName: { $exists: true } },
    { $unset: { productName: "" } }
  );
  console.log(`FoodStock: Removed productName from ${foodResult.modifiedCount} documents.`);

  const medicalResult = await mongoose.connection.collection('medicalstocks').updateMany(
    { productName: { $exists: true } },
    { $unset: { productName: "" } }
  );
  console.log(`MedicalStock: Removed productName from ${medicalResult.modifiedCount} documents.`);

  await mongoose.disconnect();
  console.log('Cleanup complete.');
})();
