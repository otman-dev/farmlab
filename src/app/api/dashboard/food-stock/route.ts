import { NextRequest, NextResponse } from "next/server";
import { getCloudConnection } from "@/lib/mongodb-cloud";



import FoodStockSchema from '@/models/FoodStock';
import ProductModel from '@/models/Product';

export async function GET() {
  const conn = await getCloudConnection();
  const FoodStock = conn.models.FoodStock || conn.model('FoodStock', FoodStockSchema.schema || FoodStockSchema);
  try {
    const stocks = await FoodStock.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ stocks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch food stock" }, { status: 500 });
  }
}

// PATCH endpoint to increment or decrement available units for a product in FoodStock
export async function PATCH(req: NextRequest) {
  const conn = await getCloudConnection();
  const FoodStock = conn.models.FoodStock || conn.model('FoodStock', FoodStockSchema.schema || FoodStockSchema);
  const Product = conn.models.Product || conn.model('Product', ProductModel.schema || ProductModel);
  const { productId, action } = await req.json();
  if (!productId || !["increment", "decrement"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    let stock = await FoodStock.findOne({ productId });
    if (!stock) {
      if (action === "increment") {
        // Get product name for denormalization
        const product = await Product.findById(productId);
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  stock = await FoodStock.create({ productId, quantity: 1 });
        return NextResponse.json({ success: true, quantity: stock.quantity });
      } else {
        return NextResponse.json({ error: "Stock not found" }, { status: 404 });
      }
    }
    if (action === "increment") {
      stock.quantity += 1;
    } else if (action === "decrement") {
      if (stock.quantity === 0) {
        return NextResponse.json({ error: "No units to remove" }, { status: 400 });
      }
      stock.quantity -= 1;
    }
    await stock.save();
    return NextResponse.json({ success: true, quantity: stock.quantity });
  } catch {
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}


// POST endpoint to create a new food stock entry
export async function POST(req: NextRequest) {
  const conn = await getCloudConnection();
  const FoodStock = conn.models.FoodStock || conn.model('FoodStock', FoodStockSchema.schema || FoodStockSchema);
  const Product = conn.models.Product || conn.model('Product', ProductModel.schema || ProductModel);
  const { product, quantity } = await req.json();
  try {
    // Get product name for denormalization
    const prod = await Product.findById(product);
    if (!prod) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const newStock = await FoodStock.create({ productId: product, quantity: quantity ?? 0 });
    return NextResponse.json({ stock: newStock });
  } catch {
    return NextResponse.json({ error: "Failed to create food stock" }, { status: 500 });
  }
}
