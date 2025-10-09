import { NextResponse } from 'next/server';
import getSensorLogsCollection from '@/lib/mongodb-preview-client';

export async function GET() {
  try {
    const collection = await getSensorLogsCollection();

    // Aggregate latest log per sensor station based on payload.device_id
    const agg = await collection
      .aggregate([
        { $match: { 'payload.device_id': { $regex: '^sensorstation', $options: 'i' } } },
        { $sort: { timestamp: -1 } },
        { $group: { _id: '$payload.device_id', doc: { $first: '$$ROOT' } } },
      ])
      .toArray();

    const sensorStations = agg.map((g) => ({ device_id: g._id, latest: g.doc }));
    return NextResponse.json({ sensorStations });
  } catch (error) {
    console.error('Error fetching sensor station logs (preview):', error);
    return NextResponse.json({ error: 'Failed to fetch sensor station logs' }, { status: 500 });
  }
}
