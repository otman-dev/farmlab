
import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getStaffModel } from '@/models/Staff.cloud';


export async function GET() {
  const conn = await cloudConnPromise;
  const Staff = getStaffModel(conn);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staffList = await (Staff as any).find();
  return NextResponse.json({ staff: staffList });
}


export async function POST(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Staff = getStaffModel(conn);
  const data = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newStaff = await (Staff as any).create(data);
  return NextResponse.json(newStaff, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const Staff = getStaffModel(conn);
    
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('id');
    
    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deletedStaff = await (Staff as any).findByIdAndDelete(staffId);
    
    if (!deletedStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Staff member deleted successfully',
      staff: deletedStaff 
    });
  } catch (err) {
    console.error('Error deleting staff:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
