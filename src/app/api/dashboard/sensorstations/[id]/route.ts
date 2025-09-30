import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const collectionName = `${id}_logs`;

    const client = await clientPromise;
    const db = client.db('farmLab');

    // Calculate timestamp for 3 days ago (minimum)
    const threeDaysAgo = Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60);
    
    // Fetch readings from the last 3 days minimum
    const readings = await db.collection(collectionName)
      .find({
        datetime_unix: { $gte: threeDaysAgo }
      })
      .sort({ datetime_unix: 1 }) // Ascending order (oldest first)
      .toArray();

    // If we have less than 3 days of data, fetch more historical data
    let finalReadings = readings;
    if (readings.length === 0) {
      // If no data in last 3 days, fetch the latest 100 readings
      finalReadings = await db.collection(collectionName)
        .find({})
        .sort({ datetime_unix: -1 })
        .limit(100)
        .toArray();
      finalReadings.reverse(); // Convert to chronological order
    } else if (readings.length < 50) {
      // If we have some data but less than expected, fetch more to ensure good visualization
      const additionalReadings = await db.collection(collectionName)
        .find({
          datetime_unix: { $lt: threeDaysAgo }
        })
        .sort({ datetime_unix: -1 })
        .limit(100 - readings.length)
        .toArray();
      
      // Combine and sort
      finalReadings = [...additionalReadings.reverse(), ...readings];
    }

    return NextResponse.json({ 
      readings: finalReadings,
      dataRange: {
        from: finalReadings.length > 0 ? new Date(finalReadings[0].datetime_unix * 1000).toISOString() : null,
        to: finalReadings.length > 0 ? new Date(finalReadings[finalReadings.length - 1].datetime_unix * 1000).toISOString() : null,
        count: finalReadings.length
      }
    });
  } catch (error) {
    console.error('Error fetching sensor station details:', error);
    return NextResponse.json({ error: 'Failed to fetch sensor station details' }, { status: 500 });
  }
}