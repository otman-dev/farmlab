
import { NextRequest, NextResponse } from 'next/server';

// Mock API route for build purposes

// Simplified interface for MedicalStock
interface MedicalStock {
  _id: string;
  productId: string;
  quantity: number;
  createdAt: string;
}

// Mock data
const mockMedicalStocks: MedicalStock[] = [
  {
    _id: 'ms1',
    productId: 'p1',
    quantity: 15,
    createdAt: '2025-09-20T00:00:00Z'
  },
  {
    _id: 'ms2',
    productId: 'p2',
    quantity: 8,
    createdAt: '2025-09-22T00:00:00Z'
  }
];

// GET: List all medical stock entries
export async function GET() {
  try {
    return NextResponse.json({ stocks: mockMedicalStocks });
  } catch (err) {
    console.error('Error fetching medical stocks:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH: Increment or decrement available units for a product in MedicalStock
export async function PATCH(req: NextRequest) {
  try {
    const { productId, action } = await req.json();
    
    if (!productId || !["increment", "decrement"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    // Find the stock item in our mock data
    const stockIndex = mockMedicalStocks.findIndex(stock => stock.productId === productId);
    let quantity: number;
    
    if (stockIndex === -1) {
      if (action === "increment") {
        // Create a new stock item
        const newStock = {
          _id: `ms_${Date.now()}`,
          productId,
          quantity: 1,
          createdAt: new Date().toISOString()
        };
        mockMedicalStocks.push(newStock);
        quantity = 1;
      } else {
        return NextResponse.json({ error: "Stock not found" }, { status: 404 });
      }
    } else {
      // Update existing stock
      if (action === "increment") {
        mockMedicalStocks[stockIndex].quantity += 1;
      } else if (action === "decrement") {
        if (mockMedicalStocks[stockIndex].quantity === 0) {
          return NextResponse.json({ error: "No units to remove" }, { status: 400 });
        }
        mockMedicalStocks[stockIndex].quantity -= 1;
      }
      quantity = mockMedicalStocks[stockIndex].quantity;
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
    const { productId, quantity } = await req.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    
    // Create a mock stock entry
    const newStock = {
      _id: `ms_${Date.now()}`,
      productId,
      quantity: quantity ?? 0,
      createdAt: new Date().toISOString()
    };
    
    // Add to our mock data
    mockMedicalStocks.push(newStock);
    
    return NextResponse.json({ stock: newStock });
  } catch (err) {
    console.error('Error creating medical stock:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
