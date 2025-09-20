import { NextRequest, NextResponse } from 'next/server';
import { getCloudConnection } from '@/lib/mongodb-cloud';
import ProductSchema, { Product } from '@/models/Product';
import { Model } from 'mongoose';

let cachedProductModel: Model<Product> | null = null;
async function getCloudProductModel() {
  const conn = await getCloudConnection();
  if (!cachedProductModel) {
    cachedProductModel = conn.models.Product || conn.model<Product>('Product', ProductSchema.schema || ProductSchema);
  }
  return cachedProductModel;
}


export async function GET() {
  const ProductModel = await getCloudProductModel();
  // Return all unique products (by name)
  const products = await ProductModel.find().sort({ name: 1 });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  try {
    const ProductModel = await getCloudProductModel();
  const body = await request.json();
    const {
      name,
      category,
      description,
      unit,
      unitAmount,
      goodFor,
      expirationDate,
      firstUsageDate,
      usageDescription
    } = body;
    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }
    // Check for duplicate by name and category
    const existing = await ProductModel.findOne({ name, category });
    if (existing) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 });
    }
  // Build product object
  const productData: Partial<Product> = { name, category, description };
    if (category === 'animal_medicine') {
      if (unit) productData.unit = unit;
      if (unitAmount) productData.amountPerUnit = unitAmount;
      if (goodFor) {
        productData.goodFor = Array.isArray(goodFor)
          ? goodFor
          : typeof goodFor === "string"
            ? JSON.parse(goodFor)
            : [];
      }
  // Removed: expirationDate and firstUsageDate are not in Product type
      if (usageDescription) productData.usageDescription = usageDescription;
    }
    const product = await ProductModel.create(productData);
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
