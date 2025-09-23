import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';

import { getAttendanceModel } from '@/models/Attendance.cloud';

// GET: List attendance records, optionally filter by date or staff
export async function GET(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Attendance = getAttendanceModel(conn);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const staffId = searchParams.get('staff');
  const filter: Record<string, unknown> = {};
  if (date) {
    // If date is YYYY-MM, return all records for that month
    if (/^\d{4}-\d{2}$/.test(date)) {
      filter.date = { $regex: `^${date}-` };
    } else {
      // Exact date match
      filter.date = date;
    }
  }
  if (staffId) {
    filter.staff = staffId;
  }
  const records = await Attendance.find(filter).populate('staff');
  return NextResponse.json(records);
}


// POST: Add or update attendance record { staff: staffId, date: yyyy-mm-dd, state: 'present' | 'absent' }
export async function POST(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Attendance = getAttendanceModel(conn);
  const data = await req.json();
  // Expect date as YYYY-MM-DD string
  const date = data.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }
  if (!['present', 'absent'].includes(data.state)) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }
  let result;
  if (data.state === 'present') {
    // Upsert attendance record as present
    const record = await Attendance.findOneAndUpdate(
      { staff: data.staff, date },
      { staff: data.staff, date, state: 'present' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    result = record;
  } else {
    // Remove attendance record if marking as absent
    await Attendance.deleteOne({ staff: data.staff, date });
    result = null;
  }
  return NextResponse.json(result, { status: 201 });
}

// DELETE: Remove attendance record or set state to absent { staff: staffId, date: yyyy-mm-dd }
export async function DELETE(req: NextRequest) {
  const conn = await cloudConnPromise;
  const Attendance = getAttendanceModel(conn);
  const { staff, date } = await req.json();
  // Instead of deleting, set state to 'absent' if record exists
  const record = await Attendance.findOneAndUpdate(
    { staff, date },
    { state: 'absent' },
    { new: true }
  );
  // If no record, nothing to do
  return NextResponse.json({ success: true, record });
}
