
import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';

// GET: List all medical stock entries
export async function GET() {
  try {
    const conn = await cloudConnPromise;
    const MedicalStock = getMedicalStockModel(conn);
    const stocks = await MedicalStock.find();
    return NextResponse.json({ stocks });
  } catch (err) {
    console.error('Error fetching medical stocks:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH: Increment or decrement available units for a product in MedicalStock
export async function PATCH(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const MedicalStock = getMedicalStockModel(conn);
    const { productId, action } = await req.json();
    
    if (!productId || !["increment", "decrement"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    // Find the stock item
    let stock = await MedicalStock.findOne({ productId });
    let quantity: number;
    
    if (!stock) {
      if (action === "increment") {
        // Create a new stock item
        stock = await MedicalStock.create({
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
  } catch (err) {
    console.error('Error updating medical stock:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: Add new medical stock entry
export async function POST(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const MedicalStock = getMedicalStockModel(conn);
    const { productId, quantity } = await req.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    
    // Create a new stock entry
    const stock = await MedicalStock.create({
      productId,
      quantity: quantity ?? 0
    });
    
    return NextResponse.json({ stock });
  } catch (err) {
    console.error('Error creating medical stock:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
