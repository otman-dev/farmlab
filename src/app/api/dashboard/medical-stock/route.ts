import { NextRequest, NextResponse } from 'next/server';
import { getCloudConnection } from '@/lib/mongodb-cloud';
import MedicalStockSchema, { MedicalStock } from '@/models/MedicalStock';
import ProductSchema, { Product } from '@/models/Product';
import { Model } from 'mongoose';

let cachedMedicalStockModel: Model<MedicalStock> | null = null;
let cachedProductModel: Model<Product> | null = null;
async function getCloudModels() {
  const conn = await getCloudConnection();
  if (!cachedMedicalStockModel) {
    cachedMedicalStockModel = conn.models.MedicalStock || conn.model<MedicalStock>('MedicalStock', MedicalStockSchema.schema || MedicalStockSchema);
  }
  if (!cachedProductModel) {
    cachedProductModel = conn.models.Product || conn.model<Product>('Product', ProductSchema.schema || ProductSchema);
  }
  return { MedicalStockModel: cachedMedicalStockModel, ProductModel: cachedProductModel };
}

// POST: Add new medical stock entry
export async function POST(req: NextRequest) {
  try {
    const { MedicalStockModel, ProductModel } = await getCloudModels();
    const { productId, units } = await req.json();
    if (!productId || !Array.isArray(units) || units.length === 0) {
      return NextResponse.json({ error: 'Missing productId or units' }, { status: 400 });
    }
    // Validate product exists
    const product = await ProductModel.findById(productId);
    if (!product || product.category !== 'animal_medicine') {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }
    // Create medical stock entry
    const stock = await MedicalStockModel.create({ product: productId, units });
    return NextResponse.json({ stock });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET: List all medical stock entries
export async function GET() {
  try {
    const { MedicalStockModel } = await getCloudModels();
    const stocks = await MedicalStockModel.find().populate('product');
    return NextResponse.json({ stocks });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH: Update a unit's openedAt date
export async function PATCH(req: NextRequest) {
  try {
    const { MedicalStockModel } = await getCloudModels();
    const { stockId, unitIndex, openedAt } = await req.json();
    if (!stockId || typeof unitIndex !== 'number' || !openedAt) {
      return NextResponse.json({ error: 'Missing stockId, unitIndex, or openedAt' }, { status: 400 });
    }
    const stock = await MedicalStockModel.findById(stockId);
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }
    if (!stock.units[unitIndex]) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    stock.units[unitIndex].openedAt = new Date(openedAt);
    await stock.save();
    return NextResponse.json({ stock });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
