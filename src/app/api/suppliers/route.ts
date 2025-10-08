import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getSupplierModel } from '@/models/Supplier.cloud';

// GET: List all suppliers
export async function GET() {
  try {
    const conn = await cloudConnPromise;
    const Supplier = getSupplierModel(conn);
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return NextResponse.json({ suppliers });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

// POST: Create a new supplier
export async function POST(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Supplier = getSupplierModel(conn);
    const data = await request.json();
    
    // Validate required fields with better error messages
    if (!data.entrepriseName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!data.address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    
    // Filter out empty phone numbers
    const validPhones = (data.phones || []).filter((phone: string) => phone && phone.trim());
    
    const supplier = await Supplier.create({
      name: data.name || '', // Make name optional with default empty string
      entrepriseName: data.entrepriseName,
      address: data.address,
      description: data.description || '',
      phones: validPhones, // Use filtered phones (can be empty array)
      email: data.email || '',
      city: data.city || '',
      notes: data.notes || '',
    });
    return NextResponse.json({ supplier });
  } catch (err) {
    console.error('Error creating supplier:', err);
    // Handle mongoose validation errors
    if ((err as any).name === 'ValidationError') {
      const validationErrors = Object.values((err as any).errors).map((error: any) => error.message);
      return NextResponse.json({ error: validationErrors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT: Update a supplier
export async function PUT(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Supplier = getSupplierModel(conn);
    const { _id, ...update } = await request.json();
    if (!_id) {
      return NextResponse.json({ error: 'Missing supplier id' }, { status: 400 });
    }
    // Only allow updating the new fields
    const allowedFields = ['name', 'entrepriseName', 'address', 'description', 'phones', 'email', 'city', 'category', 'notes'];
    const updateData: Partial<{
      name: string;
      entrepriseName: string;
      address: string;
      description?: string;
      phones: string[];
      email?: string;
      city?: string;
      category?: string;
      notes?: string;
    }> = {};
    for (const field of allowedFields) {
      if (update[field] !== undefined) (updateData as Record<string, unknown>)[field] = update[field];
    }
    const supplier = await Supplier.findByIdAndUpdate(_id, updateData, { new: true });
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    return NextResponse.json({ supplier });
  } catch (err) {
    console.error('Error updating supplier:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: Remove a supplier
export async function DELETE(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Supplier = getSupplierModel(conn);
    const { _id } = await request.json();
    if (!_id) {
      return NextResponse.json({ error: 'Missing supplier id' }, { status: 400 });
    }
    const supplier = await Supplier.findByIdAndDelete(_id);
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
