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

export async function DELETE(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Product = getProductModel(conn);
    
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Product deleted successfully',
      product: deletedProduct 
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
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
      usageDescription,
      kgPerUnit
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
      kgPerUnit?: number;
    } = {
      name,
      category,
      description
    };
    
    if (category === 'animal_feed') {
      // Validate and add kgPerUnit for animal feed
      if (kgPerUnit) {
        const kgValue = parseFloat(kgPerUnit);
        if (isNaN(kgValue) || kgValue <= 0) {
          return NextResponse.json({ error: 'Kilogram per unit must be a positive number' }, { status: 400 });
        }
        productData.kgPerUnit = kgValue;
      }
    } else if (category === 'animal_medicine') {
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
