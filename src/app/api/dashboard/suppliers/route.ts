import { NextRequest, NextResponse } from 'next/server';

import { getCloudConnection } from '@/lib/mongodb-cloud';
import SupplierModel from '@/models/Supplier';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CloudSupplierModel = any;

let cachedSupplierModel: CloudSupplierModel | null = null;
async function getCloudSupplierModel(): Promise<CloudSupplierModel> {
  if (cachedSupplierModel) return cachedSupplierModel;
  const conn = await getCloudConnection();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cachedSupplierModel = (conn.models.Supplier || conn.model('Supplier', SupplierModel.schema)) as any;
  return cachedSupplierModel;
}

// GET: List all suppliers
export async function GET() {
  const SupplierModel = await getCloudSupplierModel();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suppliers = await (SupplierModel as any).find().sort({ createdAt: -1 });
  return NextResponse.json({ suppliers });
}

// POST: Create a new supplier
export async function POST(request: NextRequest) {
  const SupplierModel = await getCloudSupplierModel();
  const data = await request.json();
  const requiredFields = ['name', 'entrepriseName', 'address', 'phones'];
  for (const field of requiredFields) {
    if (!data[field] || (field === 'phones' && (!Array.isArray(data.phones) || data.phones.length === 0))) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }
  const supplier = await SupplierModel.create({
    name: data.name,
    entrepriseName: data.entrepriseName,
    address: data.address,
    description: data.description,
    phones: data.phones,
    email: data.email,
    city: data.city,
    category: data.category,
    notes: data.notes,
  });
  return NextResponse.json({ supplier });
}

// PUT: Update a supplier
export async function PUT(request: NextRequest) {
  const SupplierModel = await getCloudSupplierModel();
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
  const supplier = await SupplierModel.findByIdAndUpdate(_id, updateData, { new: true });
  if (!supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }
  return NextResponse.json({ supplier });
}

// DELETE: Remove a supplier
export async function DELETE(request: NextRequest) {
  const SupplierModel = await getCloudSupplierModel();
  const { _id } = await request.json();
  if (!_id) {
    return NextResponse.json({ error: 'Missing supplier id' }, { status: 400 });
  }
  const supplier = await SupplierModel.findByIdAndDelete(_id);
  if (!supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
