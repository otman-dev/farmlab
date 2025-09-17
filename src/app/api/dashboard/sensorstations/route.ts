import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('farmLab');
    // List all collections for sensor stations only (e.g., sensorstation01_logs)
    const collections = await db.listCollections().toArray();
    const logCollections = collections.filter(c => c.name.startsWith('sensorstation') && c.name.endsWith('_logs'));

    // For each log collection, get the latest document
    const latestLogs = await Promise.all(
      logCollections.map(async (col) => {
        const doc = await db.collection(col.name)
          .find({})
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray();
        return doc[0] ? { ...doc[0], collection: col.name } : null;
      })
    );

    // Filter out nulls (empty collections)
    const filtered = latestLogs.filter(Boolean);
    return NextResponse.json({ sensorStations: filtered });
  } catch (error) {
    console.error('Error fetching sensor station logs:', error);
    return NextResponse.json({ error: 'Failed to fetch sensor station logs' }, { status: 500 });
  }
}
