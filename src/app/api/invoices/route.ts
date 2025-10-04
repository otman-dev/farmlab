import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getProductModel } from '@/models/Product.cloud';
import { getSupplierModel } from '@/models/Supplier.cloud';

export async function POST(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const body = await req.json();
    const { invoiceNumber, supplierId, products, date } = body;
    
    // Basic validation
    if (!invoiceNumber || !supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Fetch supplier details from database
    const Supplier = getSupplierModel(conn);
    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 400 });
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
        _id: supplier._id,
        name: supplier.name,
        entrepriseName: supplier.entrepriseName
      },
      products: productsWithCalcs,
      grandTotal,
      invoiceDate: date ? new Date(date) : new Date()
    });

    // Update food and medical stock automatically
    const FoodStock = getFoodStockModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    const Product = getProductModel(conn);
    
    const stockUpdates = [];
    
    for (const product of productsWithCalcs) {
      if (product.quantity > 0 && (product.category === 'animal_feed' || product.category === 'animal_medicine')) {
        try {
          // Find the product by name to get its ID
          const productDoc = await Product.findOne({ name: product.name });
          if (productDoc) {
            const productId = productDoc._id.toString();
            
            if (product.category === 'animal_feed') {
              // Update food stock
              let foodStock = await FoodStock.findOne({ productId });
              
              if (foodStock) {
                // Add the new quantity to existing stock
                const oldQuantity = foodStock.quantity;
                foodStock.quantity += product.quantity;
                await foodStock.save();
                stockUpdates.push(`Food Stock - ${product.name}: ${oldQuantity} + ${product.quantity} = ${foodStock.quantity} units`);
              } else {
                // Create new food stock entry
                foodStock = await FoodStock.create({
                  productId,
                  quantity: product.quantity
                });
                stockUpdates.push(`Food Stock - ${product.name}: Created with ${product.quantity} units`);
              }
            } else if (product.category === 'animal_medicine') {
              // Update medical stock
              let medicalStock = await MedicalStock.findOne({ productId });
              
              if (medicalStock) {
                // Add the new quantity to existing stock
                const oldQuantity = medicalStock.quantity;
                medicalStock.quantity += product.quantity;
                await medicalStock.save();
                stockUpdates.push(`Medical Stock - ${product.name}: ${oldQuantity} + ${product.quantity} = ${medicalStock.quantity} units`);
              } else {
                // Create new medical stock entry
                medicalStock = await MedicalStock.create({
                  productId,
                  quantity: product.quantity
                });
                stockUpdates.push(`Medical Stock - ${product.name}: Created with ${product.quantity} units`);
              }
            }
          } else {
            console.warn(`Product not found in database: ${product.name}`);
            stockUpdates.push(`Warning: Product "${product.name}" not found in database`);
          }
        } catch (stockError) {
          console.error(`Failed to update stock for ${product.name}:`, stockError);
          stockUpdates.push(`Error: Failed to update stock for ${product.name}`);
          // Don't fail the invoice creation if stock update fails
        }
      }
    }
    
    console.log('Stock updates completed:', stockUpdates);
    
    return NextResponse.json({ 
      invoice, 
      stockUpdates,
      message: 'Invoice created successfully and stock levels updated automatically' 
    });
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const Supplier = getSupplierModel(conn);
    
    // Fetch all invoices
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    
    // Populate supplier information for each invoice
    const populatedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        const invoiceObj = invoice.toObject();
        
        // If invoice has a supplier with _id, fetch the actual supplier data
        if (invoiceObj.supplier && invoiceObj.supplier._id) {
          try {
            const supplierData = await Supplier.findById(invoiceObj.supplier._id);
            if (supplierData) {
              invoiceObj.supplier = {
                _id: supplierData._id.toString(),
                name: supplierData.name,
                entrepriseName: supplierData.entrepriseName
              };
            }
          } catch (supplierErr) {
            console.warn(`Failed to fetch supplier ${invoiceObj.supplier._id}:`, supplierErr);
            // Keep the existing supplier data as fallback
          }
        }
        
        return invoiceObj;
      })
    );
    
    return NextResponse.json({ invoices: populatedInvoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

