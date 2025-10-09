import { NextRequest, NextResponse } from 'next/server';
import getSensorLogsCollection from '@/lib/mongodb-preview-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deviceId = id;

    const collection = await getSensorLogsCollection();

    // Calculate timestamp for 3 days ago (in seconds)
    const threeDaysAgo = Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60;

    // Fetch readings for this device from the preview collection
    const readings = await collection
      .find({ 'payload.device_id': deviceId, 'payload.datetime_unix': { $gte: threeDaysAgo } })
      .sort({ 'payload.datetime_unix': 1 })
      .toArray();

    let finalReadings = readings;
    if (readings.length === 0) {
      // fallback: latest 100 entries for the device
      finalReadings = await collection
        .find({ 'payload.device_id': deviceId })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();
      finalReadings.reverse();
    }

    return NextResponse.json({
      readings: finalReadings,
      dataRange: {
        from: finalReadings.length > 0 ? new Date((finalReadings[0].payload.datetime_unix || 0) * 1000).toISOString() : null,
        to: finalReadings.length > 0 ? new Date((finalReadings[finalReadings.length - 1].payload.datetime_unix || 0) * 1000).toISOString() : null,
        count: finalReadings.length,
      },
    });
  } catch (error) {
    console.error('Error fetching sensor station details (preview):', error);
    return NextResponse.json({ error: 'Failed to fetch sensor station details' }, { status: 500 });
  }
}