// Seed food stock data into the cloud database
const mongoose = require("mongoose");
const Product = require("../src/models/Product.js");
const FoodStock = require("../src/models/FoodStock.js");
const { getCloudConnection } = require("../src/lib/mongodb-cloud.js");
// For ESModule transpiled default export compatibility
const ProductModel = Product.default || Product;
const FoodStockModel = FoodStock.default || FoodStock;

async function seed() {
  await getCloudConnection();


  // Find or create a product of type animal_feed
  let animalFeed = await ProductModel.findOne({ category: 'animal_feed' });
  if (!animalFeed) {
    animalFeed = await ProductModel.create({
      name: "Premium Sheep Feed",
      category: "animal_feed",
      price: 100,
      kilogramQuantity: 50,
      unit: "bag",
      unitCount: 10,
      description: "High quality feed for sheep.",
      createdAt: new Date(),
    });
  }

  // Create food stock entry for this product
  const stocks = [
    {
      product: animalFeed._id,
      units: [{}, {}, {}, {}, {}], // 5 units available
    },
  ];

  await FoodStockModel.deleteMany({});
  await FoodStockModel.insertMany(stocks);
  console.log("Seeded food stock data.");
  process.exit();
}

seed().catch(e => { console.error(e); process.exit(1); });
