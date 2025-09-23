
import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getStaffModel } from '@/models/Staff.cloud';


export async function GET() {
  const conn = await cloudConnPromise;
  const Staff = getStaffModel(conn);
  const staffList = await Staff.find();
  return NextResponse.json({ staff: staffList });
}


export async function POST(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Staff = getStaffModel(conn);
  const data = await req.json();
  const newStaff = await Staff.create(data);
  return NextResponse.json(newStaff, { status: 201 });
}
