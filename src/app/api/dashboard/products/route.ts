import { NextRequest, NextResponse } from 'next/server';

// Mock API route for build purposes

// Product interface from your model (simplified)
interface Product {
  _id: string;
  name: string;
  category: 'animal_feed' | 'animal_medicine';
  price?: number;
  description?: string;
  createdAt: string;
  usageDescription?: string;
  goodFor?: string[];
  amountPerUnit?: number;
  unit?: string;
}

// Mock products data
const mockProducts: Product[] = [
  {
    _id: 'prod1',
    name: 'Sheep Feed Premium',
    category: 'animal_feed',
    price: 45.99,
    description: 'High quality sheep feed',
    createdAt: '2025-09-15T00:00:00Z'
  },
  {
    _id: 'prod2',
    name: 'Antibiotic Solution',
    category: 'animal_medicine',
    price: 89.99,
    description: 'General purpose antibiotic',
    createdAt: '2025-09-18T00:00:00Z',
    usageDescription: 'Apply twice daily',
    goodFor: ['sheep', 'cattle'],
    amountPerUnit: 100,
    unit: 'ml'
  }
];

export async function GET() {
  // Return mock products data
  return NextResponse.json({ products: mockProducts });
}

export async function POST(request: NextRequest) {
  try {
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
    const existing = mockProducts.find(p => p.name === name && p.category === category);
    if (existing) {
      return NextResponse.json({ error: 'Product already exists' }, { status: 400 });
    }
    
    // Build product object for mock response
    const product: Product = {
      _id: `prod_${Date.now()}`,
      name,
      category: category as 'animal_feed' | 'animal_medicine',
      description,
      createdAt: new Date().toISOString()
    };
    
    if (category === 'animal_medicine') {
      if (unit) product.unit = unit;
      if (unitAmount) product.amountPerUnit = unitAmount;
      if (goodFor) {
        product.goodFor = Array.isArray(goodFor)
          ? goodFor
          : typeof goodFor === "string"
            ? JSON.parse(goodFor)
            : [];
      }
      if (usageDescription) product.usageDescription = usageDescription;
    }
    
    // Add to mock data
    mockProducts.push(product);
    
    return NextResponse.json({ product });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
