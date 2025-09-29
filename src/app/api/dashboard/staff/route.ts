
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
