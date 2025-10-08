import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getProductModel } from '@/models/Product.cloud';

export async function GET(request: Request) {
  try {
    const conn = await cloudConnPromise;
    const Product = getProductModel(conn);

    const url = new URL((request as any).url);
    const categoryParam = url.searchParams.get('category');

  const filter: any = {};
    if (categoryParam) {
      // support comma-separated categories
      const categories = categoryParam.split(',').map(c => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        filter.category = { $in: categories };
      }
    }

    const products = await Product.find(filter).lean();
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

export async function PUT(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Product = getProductModel(conn);
    
    const body = await request.json();
    const {
      id,
      name,
      category,
      description,
      unit,
      unitAmount,
      amountPerUnit,
      goodFor,
      usageDescription,
      kgPerUnit,
      // Plant-specific fields
      unitType,
      kgPerPackage,
      seedType,
      plantingInstructions,
      harvestTime,
      growthConditions
    } = body;
    
    // Basic validation
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }
    
    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check for duplicate by name and category (excluding current product)
    const duplicate = await Product.findOne({ 
      name, 
      category, 
      _id: { $ne: id } 
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Product with this name already exists in this category' }, { status: 400 });
    }
    
    // Build update object
    const updateData: any = {
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
        updateData.kgPerUnit = kgValue;
      }
    } else if (category === 'animal_medicine') {
      if (unit) updateData.unit = unit;
      if (unitAmount || amountPerUnit) updateData.amountPerUnit = unitAmount || amountPerUnit;
      if (goodFor) {
        updateData.goodFor = Array.isArray(goodFor)
          ? goodFor
          : typeof goodFor === "string"
            ? JSON.parse(goodFor)
            : [];
      }
      if (usageDescription) updateData.usageDescription = usageDescription;
    } else if (category === 'plant_seeds') {
      // Handle plant seeds with weight-based or count-based options
      if (unitType) updateData.unitType = unitType;
      
      if (unitType === 'weight') {
        // Weight-based: accept either kgPerPackage or kgPerUnit from the payload
        const weightStr = (kgPerPackage ?? kgPerUnit) as any;
        if (weightStr) {
          const kgValue = parseFloat(weightStr);
          if (isNaN(kgValue) || kgValue <= 0) {
            return NextResponse.json({ error: 'Weight per package must be a positive number' }, { status: 400 });
          }
          updateData.kgPerUnit = kgValue;
          updateData.unit = 'bag'; // Default unit for weight-based
        }
      } else if (unitType === 'count') {
        // Count-based: traditional seed count
        if (unit) updateData.unit = unit;
        if (amountPerUnit) updateData.amountPerUnit = parseFloat(amountPerUnit);
      }
      
      // Add seed-specific fields
      if (seedType) updateData.seedType = seedType;
      if (plantingInstructions) updateData.plantingInstructions = plantingInstructions;
      if (harvestTime) updateData.harvestTime = harvestTime;
      if (growthConditions) updateData.growthConditions = growthConditions;
    } else if (['plant_seedlings', 'plant_nutrition', 'plant_medicine'].includes(category)) {
      // Handle other plant products
      if (unit) updateData.unit = unit;
      if (amountPerUnit) updateData.amountPerUnit = parseFloat(amountPerUnit);
      if (plantingInstructions) updateData.plantingInstructions = plantingInstructions;
      
      // For seedlings, also save seed-specific fields
      if (category === 'plant_seedlings') {
        if (seedType) updateData.seedType = seedType;
        if (harvestTime) updateData.harvestTime = harvestTime;
        if (growthConditions) updateData.growthConditions = growthConditions;
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    return NextResponse.json({ product: updatedProduct });
  } catch (err) {
    console.error('Error updating product:', err);
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
      amountPerUnit,
      goodFor,
      usageDescription,
      kgPerUnit,
      // Plant-specific fields
      unitType,
      kgPerPackage,
      seedType,
      plantingInstructions,
      harvestTime,
      growthConditions
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
      // Plant-specific fields
      unitType?: 'weight' | 'count';
      seedType?: string;
      plantingInstructions?: string;
      harvestTime?: string;
      growthConditions?: string;
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
      if (unitAmount || amountPerUnit) productData.amountPerUnit = unitAmount || amountPerUnit;
      if (goodFor) {
        productData.goodFor = Array.isArray(goodFor)
          ? goodFor
          : typeof goodFor === "string"
            ? JSON.parse(goodFor)
            : [];
      }
      if (usageDescription) productData.usageDescription = usageDescription;
    } else if (category === 'plant_seeds') {
      // Handle plant seeds with weight-based or count-based options
      if (unitType) productData.unitType = unitType;
      
      if (unitType === 'weight') {
        // Weight-based: accept either kgPerPackage or kgPerUnit from the payload
        const weightStr = (kgPerPackage ?? kgPerUnit) as any;
        if (weightStr) {
          const kgValue = parseFloat(weightStr);
          if (isNaN(kgValue) || kgValue <= 0) {
            return NextResponse.json({ error: 'Weight per package must be a positive number' }, { status: 400 });
          }
          productData.kgPerUnit = kgValue;
          productData.unit = 'bag'; // Default unit for weight-based
        }
      } else if (unitType === 'count') {
        // Count-based: traditional seed count
        if (unit) productData.unit = unit;
        if (amountPerUnit) productData.amountPerUnit = parseFloat(amountPerUnit);
      }
      
      // Add seed-specific fields
      if (seedType) productData.seedType = seedType;
      if (plantingInstructions) productData.plantingInstructions = plantingInstructions;
      if (harvestTime) productData.harvestTime = harvestTime;
      if (growthConditions) productData.growthConditions = growthConditions;
    } else if (['plant_seedlings', 'plant_nutrition', 'plant_medicine'].includes(category)) {
      // Handle other plant products
      if (unit) productData.unit = unit;
      if (amountPerUnit) productData.amountPerUnit = parseFloat(amountPerUnit);
      if (plantingInstructions) productData.plantingInstructions = plantingInstructions;
      
      // For seedlings, also save seed-specific fields
      if (category === 'plant_seedlings') {
        if (seedType) productData.seedType = seedType;
        if (harvestTime) productData.harvestTime = harvestTime;
        if (growthConditions) productData.growthConditions = growthConditions;
      }
    }
    
    const product = await Product.create(productData);
    
    return NextResponse.json({ product });
  } catch (err) {
    console.error('Error creating product:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
