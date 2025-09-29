import { NextRequest, NextResponse } from "next/server";

// Mock API route for build purposes
// Using mock data instead of MongoDB connections

export async function GET() {
  try {
    // Mock data response
    const mockStocks = [
      { 
        _id: 'fs1', 
        productId: 'p1', 
        quantity: 10, 
        createdAt: '2025-09-20T00:00:00Z' 
      },
      { 
        _id: 'fs2', 
        productId: 'p2', 
        quantity: 5, 
        createdAt: '2025-09-22T00:00:00Z' 
      }
    ];
    
    return NextResponse.json({ stocks: mockStocks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch food stock" }, { status: 500 });
  }
}

// PATCH endpoint to increment or decrement available units for a product in FoodStock
export async function PATCH(req: NextRequest) {
  const { productId, action } = await req.json();
  
  if (!productId || !["increment", "decrement"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  
  try {
    // Mock implementation
    console.log(`PATCH food-stock: ${action} for productId ${productId}`);
    
    // In real implementation we'd check if stock exists, create it if needed, etc.
    // For the mock, we'll just return a success response with a quantity
    const quantity = action === "increment" ? 11 : 9;
    
    return NextResponse.json({ success: true, quantity });
  } catch (error) {
    console.error("Failed to update food stock:", error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}


// POST endpoint to create a new food stock entry
export async function POST(req: NextRequest) {
  const { product, quantity } = await req.json();
  
  try {
    // Mock implementation
    console.log(`POST food-stock: Create new stock for product ${product} with quantity ${quantity}`);
    
    // Create a mock response object
    const newStock = {
      _id: `mock_${Date.now()}`,
      productId: product,
      quantity: quantity ?? 0,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({ stock: newStock });
  } catch (error) {
    console.error("Failed to create food stock:", error);
    return NextResponse.json({ error: "Failed to create food stock" }, { status: 500 });
  }
}
