import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getProductModel } from '@/models/Product.cloud';

export async function GET() {
  try {
    const conn = await cloudConnPromise;
    const Product = getProductModel(conn);
    const products = await Product.find();
    return NextResponse.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Product = getProductModel(conn);
    
    const body = await request.json();
    const {
      name,
      category,
      description,
      unit,
      unitAmount,
      goodFor,
      usageDescription
    } = body;
    
    // Basic validation
    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }
    
    // Check for duplicate by name and category
    const existing = await Product.findOne({ name, category });
    if (existing) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 });
    }
    
    // Build product object
    const productData: {
      name: string;
      category: string;
      description?: string;
      unit?: string;
      amountPerUnit?: number;
      goodFor?: string[];
      usageDescription?: string;
    } = {
      name,
      category,
      description
    };
    
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
      if (usageDescription) productData.usageDescription = usageDescription;
    }
    
    const product = await Product.create(productData);
    
    return NextResponse.json({ product });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
