import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getAttendanceModel, IAttendance } from '@/models/Attendance.cloud';
import type { Model } from 'mongoose';

// GET: List attendance records, optionally filter by date or staff
export async function GET(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Attendance = getAttendanceModel(conn) as Model<IAttendance>;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const staffId = searchParams.get('staff');

  // Build query
  const query: any = {};
  if (date) {
    // Support YYYY-MM-DD or YYYY-MM
    if (/^\d{4}-\d{2}$/.test(date)) {
      query.date = { $regex: `^${date}` };
    } else {
      query.date = date;
    }
  }
  if (staffId) {
    query.staff = staffId;
  }

  // Populate staff info
  const records = await Attendance.find(query).populate('staff').exec();
  return NextResponse.json(records);
}

// POST: Add or update attendance record { staff: staffId, date: yyyy-mm-dd, state: 'present' | 'absent' }
export async function POST(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Attendance = getAttendanceModel(conn) as Model<IAttendance>;
  const data = await req.json();

  // Validate
  const date = data.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }
  if (!['present', 'absent'].includes(data.state)) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }
  if (!data.staff) {
    return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });
  }

  // Upsert attendance record
  const record = await Attendance.findOneAndUpdate(
    { staff: data.staff, date },
    { $set: { state: data.state } },
    { upsert: true, new: true }
  ).exec();
  return NextResponse.json(record, { status: 201 });
}

// DELETE: Remove attendance record or set state to absent { staff: staffId, date: yyyy-mm-dd }
export async function DELETE(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Attendance = getAttendanceModel(conn) as Model<IAttendance>;
  const { staff, date } = await req.json();
  if (!staff || !date) {
    return NextResponse.json({ error: 'Staff and date required' }, { status: 400 });
  }

  // Remove attendance record
  const deleted = await Attendance.findOneAndDelete({ staff, date }).exec();
  return NextResponse.json({ success: !!deleted, record: deleted });
}
