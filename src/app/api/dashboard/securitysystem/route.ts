import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('farmLab');
    // Get the latest log from securitySystem01_logs
    const doc = await db.collection('securitySystem01_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    if (!doc[0]) {
      return NextResponse.json({ error: 'No security logs found' }, { status: 404 });
    }
    return NextResponse.json({ log: doc[0] });
  } catch (error) {
    console.error('Error fetching security log:', error);
    return NextResponse.json({ error: 'Failed to fetch security log' }, { status: 500 });
  }
}
