
import { NextRequest, NextResponse } from 'next/server';
import { getCloudConnection } from '@/lib/mongodb-cloud';
import MedicalStockModel from '@/models/MedicalStock';
import ProductModel from '@/models/Product';

// GET: List all medical stock entries
export async function GET() {
  try {
    const conn = await getCloudConnection();
    const MedicalStock = conn.models.MedicalStock || conn.model('MedicalStock', MedicalStockModel.schema || MedicalStockModel);
    const stocks = await MedicalStock.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ stocks });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH: Increment or decrement available units for a product in MedicalStock
export async function PATCH(req: NextRequest) {
  try {
    const conn = await getCloudConnection();
    const MedicalStock = conn.models.MedicalStock || conn.model('MedicalStock', MedicalStockModel.schema || MedicalStockModel);
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema || ProductModel);
    const { productId, action } = await req.json();
    if (!productId || !["increment", "decrement"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    let stock = await MedicalStock.findOne({ productId });
    if (!stock) {
      if (action === "increment") {
        // Get product name for denormalization
        const product = await Product.findById(productId);
        if (!product || product.category !== 'animal_medicine') return NextResponse.json({ error: "Product not found" }, { status: 404 });
  stock = await MedicalStock.create({ productId, quantity: 1 });
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
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: Add new medical stock entry
export async function POST(req: NextRequest) {
  try {
    const conn = await getCloudConnection();
    const MedicalStock = conn.models.MedicalStock || conn.model('MedicalStock', MedicalStockModel.schema || MedicalStockModel);
    const Product = conn.models.Product || conn.model('Product', ProductModel.schema || ProductModel);
    const { productId, quantity } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    // Get product name for denormalization
    const prod = await Product.findById(productId);
    if (!prod || prod.category !== 'animal_medicine') return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const newStock = await MedicalStock.create({ productId, quantity: quantity ?? 0 });
    return NextResponse.json({ stock: newStock });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
