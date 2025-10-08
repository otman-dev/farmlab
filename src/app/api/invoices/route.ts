import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';
import { getProductModel } from '@/models/Product.cloud';
import { getPlantStockModel } from '@/models/PlantStock.cloud';
import { getSupplierModel } from '@/models/Supplier.cloud';

export async function POST(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const body = await req.json();
    const { supplierId, products, date } = body;
    
    // Basic validation
    if (!supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Fetch supplier details from database
    const Supplier = getSupplierModel(conn);
    const supplier = await Supplier.findById(supplierId);
    
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 400 });
    }
    
    // Calculate totals for products
    interface MedicineUnit {
      id: string;
      customId: string;
      expirationDate: string;
      firstUsageDate?: string;
    }
    
    interface ProductInput {
      name: string;
      quantity: number;
      price: number;
      category?: string;
      unit?: string;
      kgPerUnit?: number;
      description?: string;
      units?: MedicineUnit[];
      usageDescription?: string;
      goodFor?: string;
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
          category: prod.category,
          units: prod.units,
          usageDescription: prod.usageDescription,
          goodFor: prod.goodFor
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
    const invoiceData = {
      supplier: {
        _id: supplier._id,
        name: supplier.name || '', // Provide empty string as fallback to satisfy validation
        entrepriseName: supplier.entrepriseName
      },
      products: productsWithCalcs,
      grandTotal,
      invoiceDate: date ? new Date(date) : new Date()
    };
    
    console.log('Creating invoice with data:', JSON.stringify(invoiceData, null, 2));
    const invoice = await Invoice.create(invoiceData);
    console.log('Invoice created successfully:', {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      supplier: invoice.supplier
    });

    // Update food and medical stock automatically
    const FoodStock = getFoodStockModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    const Product = getProductModel(conn);
    
    const stockUpdates = [];
    
    for (const product of productsWithCalcs) {
      if (product.quantity > 0 && (product.category === 'animal_feed' || product.category === 'animal_medicine' || ['plant_seeds','plant_seedlings','plant_nutrition','plant_medicine'].includes(product.category))) {
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
              // Create individual medicine units with tracking
              const MedicineUnit = getMedicineUnitModel(conn);
              
              // Get medicine-specific data from the product
              const medicineUnits = product.units || [];
              
              // Debug: Log what we received
              console.log(`Processing medicine: ${product.name}`);
              console.log(`Product object:`, JSON.stringify(product, null, 2));
              console.log(`Medicine units received:`, JSON.stringify(medicineUnits, null, 2));
              console.log(`Units array length: ${medicineUnits.length}`);
              
              if (medicineUnits.length > 0) {
                // Validate units before creating
                const validUnits = medicineUnits.filter((unit: MedicineUnit) => 
                  unit.customId && unit.expirationDate
                );
                
                if (validUnits.length === 0) {
                  console.warn(`No valid units found for ${product.name}`);
                  stockUpdates.push(`Warning: No valid units found for ${product.name} - missing customId or expirationDate`);
                } else {
                  // Create individual medicine units
                  const unitsToCreate = validUnits.map((unit: MedicineUnit) => ({
                    productId,
                    productName: product.name,
                    customId: unit.customId,
                    expirationDate: new Date(unit.expirationDate),
                    firstUsageDate: unit.firstUsageDate ? new Date(unit.firstUsageDate) : undefined,
                    usageDescription: product.usageDescription,
                    goodFor: product.goodFor,
                    isUsed: Boolean(unit.firstUsageDate), // If usage date is set, mark as used
                    invoiceId: invoice._id.toString()
                  }));
                  
                  console.log(`Creating ${unitsToCreate.length} units for ${product.name}`);
                
                  try {
                    const createdUnits = await MedicineUnit.insertMany(unitsToCreate);
                    
                    // Update medical stock total (only count unused units)
                    const unusedUnitsCount = unitsToCreate.filter(u => !u.isUsed).length;
                  
                    let medicalStock = await MedicalStock.findOne({ productId });
                    if (medicalStock) {
                      const oldQuantity = medicalStock.quantity;
                      medicalStock.quantity += unusedUnitsCount;
                      await medicalStock.save();
                      stockUpdates.push(`Medical Stock - ${product.name}: ${oldQuantity} + ${unusedUnitsCount} = ${medicalStock.quantity} available units (${createdUnits.length} total units created)`);
                    } else {
                      medicalStock = await MedicalStock.create({
                        productId,
                        quantity: unusedUnitsCount
                      });
                      stockUpdates.push(`Medical Stock - ${product.name}: Created with ${unusedUnitsCount} available units (${createdUnits.length} total units created)`);
                    }
                    
                    stockUpdates.push(`Medicine Units - ${product.name}: Created ${createdUnits.length} individual units with expiration tracking`);
                  } catch (unitError) {
                    console.error(`Failed to create medicine units for ${product.name}:`, unitError);
                    stockUpdates.push(`Error: Failed to create medicine units for ${product.name}: ${(unitError as Error).message}`);
                    
                    // Fallback to simple quantity update
                    let medicalStock = await MedicalStock.findOne({ productId });
                    if (medicalStock) {
                      const oldQuantity = medicalStock.quantity;
                      medicalStock.quantity += product.quantity;
                      await medicalStock.save();
                      stockUpdates.push(`Medical Stock - ${product.name}: Fallback update ${oldQuantity} + ${product.quantity} = ${medicalStock.quantity} units`);
                    } else {
                      medicalStock = await MedicalStock.create({
                        productId,
                        quantity: product.quantity
                      });
                      stockUpdates.push(`Medical Stock - ${product.name}: Fallback creation with ${product.quantity} units`);
                    }
                  }
                }
              } else {
                // Fallback for medicines without unit tracking
                let medicalStock = await MedicalStock.findOne({ productId });
                if (medicalStock) {
                  const oldQuantity = medicalStock.quantity;
                  medicalStock.quantity += product.quantity;
                  await medicalStock.save();
                  stockUpdates.push(`Medical Stock - ${product.name}: ${oldQuantity} + ${product.quantity} = ${medicalStock.quantity} units (no unit tracking)`);
                } else {
                  medicalStock = await MedicalStock.create({
                    productId,
                    quantity: product.quantity
                  });
                  stockUpdates.push(`Medical Stock - ${product.name}: Created with ${product.quantity} units (no unit tracking)`);
                }
              }
            }
              else if (['plant_seeds','plant_seedlings','plant_nutrition','plant_medicine'].includes(product.category)) {
                // Update plant stock quantities (simple increment)
                const PlantStock = getPlantStockModel(conn);
                let plantStock = await PlantStock.findOne({ productId });
                if (plantStock) {
                  const oldQuantity = plantStock.quantity;
                  plantStock.quantity += product.quantity;
                  await plantStock.save();
                  stockUpdates.push(`Plant Stock - ${product.name}: ${oldQuantity} + ${product.quantity} = ${plantStock.quantity} units`);
                } else {
                  plantStock = await PlantStock.create({ productId, quantity: product.quantity });
                  stockUpdates.push(`Plant Stock - ${product.name}: Created with ${product.quantity} units`);
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

export async function PUT(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const Supplier = getSupplierModel(conn);
    const body = await req.json();
    const { invoiceId, supplierId, products, date } = body;
    
    // Basic validation
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    if (!supplierId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if invoice exists
    const existingInvoice = await Invoice.findById(invoiceId);
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Fetch supplier details
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 400 });
    }
    
    // Calculate totals and prepare products
    const productsWithCalcs = products.map((prod: any) => {
      const totalPrice = prod.quantity && prod.price ? prod.quantity * prod.price : 0;
      return { ...prod, totalPrice };
    });
    
    const grandTotal = productsWithCalcs.reduce((sum: number, prod: any) => sum + (prod.totalPrice || 0), 0);
    
    // Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        supplier: {
          _id: supplier._id,
          name: supplier.name,
          entrepriseName: supplier.entrepriseName
        },
        products: productsWithCalcs,
        grandTotal,
        invoiceDate: date || new Date().toISOString().slice(0, 10)
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      invoice: updatedInvoice, 
      message: 'Invoice updated successfully' 
    });
  } catch (err) {
    console.error('Error updating invoice:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    
    // Check if invoice exists
    const existingInvoice = await Invoice.findById(invoiceId);
    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Delete the invoice
    await Invoice.findByIdAndDelete(invoiceId);
    
    return NextResponse.json({ 
      message: 'Invoice deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

