import { NextResponse } from 'next/server';
import getSensorLogsCollection from '@/lib/mongodb-preview-client';

export async function GET() {
  try {
    const collection = await getSensorLogsCollection();
    const doc = await collection
      .find({ 'payload.device_id': 'securitySystem01' })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    if (!doc[0]) {
      return NextResponse.json({ error: 'No security logs found' }, { status: 404 });
    }
    return NextResponse.json({ log: doc[0] });
  } catch (error) {
    console.error('Error fetching security log (preview):', error);
    return NextResponse.json({ error: 'Failed to fetch security log' }, { status: 500 });
  }
}
