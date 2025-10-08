import { NextRequest, NextResponse } from 'next/server';
import { getCloudConnection } from '@/lib/mongodb-cloud';
import { getPlantStockModel } from '@/models/PlantStock.cloud';
import { getProductModel } from '@/models/Product.cloud';

export async function GET() {
  try {
    const conn = await getCloudConnection();
    const PlantStock = getPlantStockModel(conn);
    const Product = getProductModel(conn);

    // Get all plant stock entries
    const plantStocks = await PlantStock.find({}).lean();

    // Populate product names
    const enrichedStocks = await Promise.all(
      plantStocks.map(async (stock) => {
        const product = await Product.findById(stock.productId);
        return {
          ...stock,
          productName: product?.name || 'Unknown Product',
        };
      })
    );

    return NextResponse.json(enrichedStocks);
  } catch (error) {
    console.error('Plant stock fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plant stock' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, quantity, location } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    const conn = await getCloudConnection();
    const PlantStock = getPlantStockModel(conn);
    const Product = getProductModel(conn);

    // Verify product exists and is a plant product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const plantCategories = ['plant_seeds', 'plant_seedlings', 'plant_nutrition', 'plant_medicine'];
    if (!plantCategories.includes(product.category)) {
      return NextResponse.json(
        { error: 'Product is not a plant product' },
        { status: 400 }
      );
    }

    // Check if stock entry exists for this product
    let plantStock = await PlantStock.findOne({ productId });

    if (plantStock) {
      // Update existing stock
      plantStock.quantity += quantity;
      
      // Add units if location is provided
      if (location) {
        const newUnits = Array(quantity).fill(null).map(() => ({
          location,
          status: 'planted' as const
        }));
        plantStock.units = [...(plantStock.units || []), ...newUnits];
      }
      
      await plantStock.save();
    } else {
      // Create new stock entry
      const units = location ? Array(quantity).fill(null).map(() => ({
        location,
        status: 'planted' as const
      })) : [];

      plantStock = await PlantStock.create({
        productId,
        quantity,
        units
      });
    }

    return NextResponse.json(plantStock);
  } catch (error) {
    console.error('Plant stock creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create plant stock' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { stockId, quantity, units } = body;

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    const conn = await getCloudConnection();
    const PlantStock = getPlantStockModel(conn);

    const plantStock = await PlantStock.findById(stockId);
    if (!plantStock) {
      return NextResponse.json(
        { error: 'Plant stock not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (quantity !== undefined) {
      plantStock.quantity = quantity;
    }
    if (units !== undefined) {
      plantStock.units = units;
    }

    await plantStock.save();

    return NextResponse.json(plantStock);
  } catch (error) {
    console.error('Plant stock update error:', error);
    return NextResponse.json(
      { error: 'Failed to update plant stock' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stockId = searchParams.get('id');

    if (!stockId) {
      return NextResponse.json(
        { error: 'Stock ID is required' },
        { status: 400 }
      );
    }

    const conn = await getCloudConnection();
    const PlantStock = getPlantStockModel(conn);

    const deletedStock = await PlantStock.findByIdAndDelete(stockId);
    if (!deletedStock) {
      return NextResponse.json(
        { error: 'Plant stock not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Plant stock deleted successfully' });
  } catch (error) {
    console.error('Plant stock deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plant stock' },
      { status: 500 }
    );
  }
}