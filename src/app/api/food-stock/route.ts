import { NextRequest, NextResponse } from "next/server";
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getFoodStockModel } from '@/models/FoodStock.cloud';

export async function GET() {
  try {
    const conn = await cloudConnPromise;
    const FoodStock = getFoodStockModel(conn);
    const stocks = await FoodStock.find();
    return NextResponse.json({ stocks });
  } catch (err) {
    console.error('Error fetching food stocks:', err);
    return NextResponse.json({ error: "Failed to fetch food stock" }, { status: 500 });
  }
}

// PATCH endpoint to increment or decrement available units for a product in FoodStock
export async function PATCH(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const FoodStock = getFoodStockModel(conn);
    const { productId, action } = await req.json();
    
    if (!productId || !["increment", "decrement"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    // Find the stock item
    let stock = await FoodStock.findOne({ productId });
    let quantity: number;
    
    if (!stock) {
      if (action === "increment") {
        // Create a new stock item
        stock = await FoodStock.create({
          productId,
          quantity: 1
        });
        quantity = 1;
      } else {
        return NextResponse.json({ error: "Stock not found" }, { status: 404 });
      }
    } else {
      // Update existing stock
      if (action === "increment") {
        stock.quantity += 1;
      } else if (action === "decrement") {
        if (stock.quantity === 0) {
          return NextResponse.json({ error: "No units to remove" }, { status: 400 });
        }
        stock.quantity -= 1;
      }
      await stock.save();
      quantity = stock.quantity;
    }
    
    return NextResponse.json({ success: true, quantity });
  } catch (error) {
    console.error("Failed to update food stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

// POST endpoint to create a new food stock entry
export async function POST(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const FoodStock = getFoodStockModel(conn);
    const { product, quantity } = await req.json();
    
    // Create a new stock entry
    const stock = await FoodStock.create({
      productId: product,
      quantity: quantity ?? 0
    });
    
    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Failed to create food stock:", error);
    return NextResponse.json({ error: "Failed to create food stock" }, { status: 500 });
  }
}
