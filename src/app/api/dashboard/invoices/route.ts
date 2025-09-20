import { NextRequest, NextResponse } from 'next/server';

import { getCloudConnection } from '@/lib/mongodb-cloud';
import ProductSchema, { Product } from '@/models/Product';
import SupplierSchema, { Supplier } from '@/models/Supplier';

import mongoose, { Model, Document } from 'mongoose';


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

export interface Invoice extends Document {
  invoiceNumber: string;
  supplier: mongoose.Types.ObjectId;
  products: InvoiceProduct[];
  grandTotal: number;
  invoiceDate: Date;
  createdAt: Date;
}

const InvoiceSchema = new mongoose.Schema<Invoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  products: [
    {
      name: String,
      quantity: Number,
      price: Number,
      description: String,
      category: String,
      unit: String,
      kgPerUnit: Number,
      pricePerKilogram: Number,
      totalPrice: Number,
    }
  ],
  grandTotal: { type: Number, required: true },
  invoiceDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const cachedModels: { InvoiceModel?: Model<Invoice>, ProductModel?: Model<Product>, SupplierModel?: Model<Supplier> } = {};
async function getCloudModels() {
  const conn = await getCloudConnection();
  if (!cachedModels.InvoiceModel) {
    cachedModels.InvoiceModel = conn.models.Invoice || conn.model('Invoice', InvoiceSchema);
  }
  if (!cachedModels.ProductModel) {
    cachedModels.ProductModel = conn.models.Product || conn.model<Product>('Product', ProductSchema.schema || ProductSchema);
  }
  if (!cachedModels.SupplierModel) {
    cachedModels.SupplierModel = conn.models.Supplier || conn.model<Supplier>('Supplier', SupplierSchema.schema || SupplierSchema);
  }
  return cachedModels;
}

export async function POST(req: NextRequest) {
  try {
    const { InvoiceModel, ProductModel } = await getCloudModels();
    if (!InvoiceModel) throw new Error('InvoiceModel is not initialized');
    if (!ProductModel) throw new Error('ProductModel is not initialized');
    const body = await req.json();
  const { invoiceNumber, supplierId, products, date } = body;
    if (!invoiceNumber || !supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check for duplicate invoice number
    const existingInvoice = await InvoiceModel.findOne({ invoiceNumber });
    if (existingInvoice) {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 400 });
    }
    // Save new products if not already in Product collection (match on name and category)
    for (const prod of products) {
      if (prod.name && prod.category) {
        await ProductModel.updateOne(
          { name: prod.name, category: prod.category },
          { $setOnInsert: {
              name: prod.name,
              description: prod.description,
              category: prod.category,
              unit: prod.unit,
              usageDescription: prod.usageDescription,
              goodFor: prod.goodFor,
              amountPerUnit: prod.amountPerUnit
            }
          },
          { upsert: true }
        );
      }
    }

    // Prepare products for invoice: only relevant fields for each type
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
        // fallback for unknown category
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
    // Create invoice
    const invoice = await InvoiceModel.create({
      invoiceNumber,
      supplier: supplierId,
      products: productsWithCalcs,
      grandTotal,
      invoiceDate: date ? new Date(date) : new Date(),
    });
    return NextResponse.json({ invoice });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  const { InvoiceModel } = await getCloudModels();
  if (!InvoiceModel) throw new Error('InvoiceModel is not initialized');
  const invoices = await InvoiceModel.find().populate('supplier');
  return NextResponse.json({ invoices });
}

