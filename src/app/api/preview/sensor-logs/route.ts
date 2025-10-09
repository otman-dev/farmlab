import { NextResponse } from 'next/server';
import getSensorLogsCollection from '../../../../lib/mongodb-preview-client';

export async function GET() {
  try {
    const collection = await getSensorLogsCollection();
    const docs = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ ok: true, count: docs.length, data: docs });
  } catch (err) {
    console.error('Error fetching preview sensor logs:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
