import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const collectionName = `${id}_logs`;

    const client = await clientPromise;
    const db = client.db('farmLab');

    // Fetch the last 50 readings, sorted by datetime_unix descending
    const readings = await db.collection(collectionName)
      .find({})
      .sort({ datetime_unix: -1 })
      .limit(50)
      .toArray();

    // Reverse to get chronological order (oldest first)
    readings.reverse();

    return NextResponse.json({ readings });
  } catch (error) {
    console.error('Error fetching sensor station details:', error);
    return NextResponse.json({ error: 'Failed to fetch sensor station details' }, { status: 500 });
  }
}