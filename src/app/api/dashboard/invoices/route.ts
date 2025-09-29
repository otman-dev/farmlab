import { NextRequest, NextResponse } from 'next/server';

// Mock API route for build purposes
// Types are kept for documentation purposes

interface InvoiceProduct {
  name: string;
  quantity: number;
  price: number;
  description?: string;
  category?: string;
  unit?: string;
  kgPerUnit?: number;
  pricePerKilogram?: number;
  totalPrice?: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  supplier: {
    _id: string;
    name: string;
    entrepriseName: string;
  };
  products: InvoiceProduct[];
  grandTotal: number;
  invoiceDate: string;
  createdAt: string;
}

// Mock data for invoices
const mockInvoices: Invoice[] = [
  {
    _id: 'inv1',
    invoiceNumber: 'INV-2025-001',
    supplier: {
      _id: 'sup1',
      name: 'John Supplier',
      entrepriseName: 'Farm Supplies Inc.'
    },
    products: [
      {
        name: 'Cattle Feed',
        quantity: 10,
        price: 25.99,
        category: 'animal_feed',
        totalPrice: 259.90,
        unit: 'bag',
        kgPerUnit: 20
      }
    ],
    grandTotal: 259.90,
    invoiceDate: '2025-09-15T00:00:00Z',
    createdAt: '2025-09-15T00:00:00Z'
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceNumber, supplierId, products, date } = body;
    
    // Basic validation
    if (!invoiceNumber || !supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check for duplicate invoice number (mocked)
    if (invoiceNumber === 'INV-2025-001') {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 });
    }
    
    // Calculate totals for products
    const productsWithCalcs = products.map((prod: InvoiceProduct) => {
      if (prod.category === 'animal_medicine') {
        return {
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          totalPrice: prod.quantity && prod.price ? prod.quantity * prod.price : undefined,
          unit: prod.unit,
          description: prod.description
        };
      } else if (prod.category === 'animal_feed') {
        return {
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          totalPrice: prod.quantity && prod.price ? prod.quantity * prod.price : undefined,
          unit: prod.unit,
          kgPerUnit: prod.kgPerUnit,
          pricePerKilogram: prod.kgPerUnit && prod.price ? prod.price / prod.kgPerUnit : undefined,
          description: prod.description
        };
      } else {
        return {
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          totalPrice: prod.quantity && prod.price ? prod.quantity * prod.price : undefined
        };
      }
    });

    const grandTotal = productsWithCalcs.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    );
    
    // Create mock invoice response
    const invoice = {
      _id: `inv_${Date.now()}`,
      invoiceNumber,
      supplier: {
        _id: supplierId,
        name: 'Supplier Name', // Mock
        entrepriseName: 'Mock Enterprise'
      },
      products: productsWithCalcs,
      grandTotal,
      invoiceDate: date ? new Date(date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return mock invoices data
    return NextResponse.json({ invoices: mockInvoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

