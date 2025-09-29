import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';

export async function POST(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const body = await req.json();
    const { invoiceNumber, supplierId, products, date, supplierName, supplierEnterprise } = body;
    
    // Basic validation
    if (!invoiceNumber || !supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check for duplicate invoice number
    const existing = await Invoice.findOne({ invoiceNumber });
    if (existing) {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 });
    }
    
    // Calculate totals for products
    interface ProductInput {
      name: string;
      quantity: number;
      price: number;
      category?: string;
      unit?: string;
      kgPerUnit?: number;
      description?: string;
    }
    
    const productsWithCalcs = products.map((prod: ProductInput) => {
      if (prod.category === 'animal_medicine') {
        return {
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          totalPrice: prod.quantity && prod.price ? prod.quantity * prod.price : undefined,
          unit: prod.unit,
          description: prod.description,
          category: prod.category
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
          description: prod.description,
          category: prod.category
        };
      } else {
        return {
          name: prod.name,
          quantity: prod.quantity,
          price: prod.price,
          totalPrice: prod.quantity && prod.price ? prod.quantity * prod.price : undefined,
          category: prod.category
        };
      }
    });

    const grandTotal = productsWithCalcs.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    );
    
    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      supplier: {
        _id: supplierId,
        name: supplierName || 'Supplier Name',
        entrepriseName: supplierEnterprise || 'Enterprise Name'
      },
      products: productsWithCalcs,
      grandTotal,
      invoiceDate: date ? new Date(date) : new Date()
    });
    
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    return NextResponse.json({ invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

