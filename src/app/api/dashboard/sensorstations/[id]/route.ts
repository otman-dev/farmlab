import { NextRequest, NextResponse } from 'next/server';
import getSensorHistoryCollection from '@/lib/mongodb-history-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deviceId = id;

    console.log(`Attempting to fetch data for sensor station ${deviceId} from farmLabPreview database...`);
    const collection = await getSensorHistoryCollection();

    // Calculate timestamp for 48 hours ago (in seconds)
    const fortyEightHoursAgo = Math.floor(Date.now() / 1000) - 48 * 60 * 60;

    // Fetch readings for this device from the history collection
    // Look for the "SensorReadings" topic to get only sensor data documents
    const readings = await collection
      .find({ 
        'payload.device_id': deviceId,
        topic: { $regex: /SensorReadings$/ }, // Only get sensor reading documents, not heartbeats
        'payload.datetime_unix': { $exists: true } // Ensure datetime_unix exists
      })
      .sort({ 'payload.datetime_unix': -1 }) // Sort by datetime_unix
      .limit(500) // Get the most recent 500 readings
      .toArray();

    console.log(`Retrieved ${readings.length} readings for ${deviceId} from history database`);

    // Sort readings by datetime_unix ascending to ensure proper chart order
    let finalReadings = [...readings].sort((a, b) => {
      return a.payload.datetime_unix - b.payload.datetime_unix;
    });

    // Apply 48-hour filtering after sorting (using only datetime_unix)
    if (finalReadings.length > 0) {
      const now = Math.floor(Date.now() / 1000);
      finalReadings = finalReadings.filter(reading => {
        return reading.payload.datetime_unix > 0 && // Ensure valid datetime_unix
              (now - reading.payload.datetime_unix) <= 48 * 60 * 60;
      });
    }

    return NextResponse.json({
      readings: finalReadings,
      dataRange: {
        from: finalReadings.length > 0 
          ? new Date(finalReadings[0].payload.datetime_unix * 1000).toISOString()
          : null,
        to: finalReadings.length > 0 
          ? new Date(finalReadings[finalReadings.length - 1].payload.datetime_unix * 1000).toISOString()
          : null,
        count: finalReadings.length,
      },
    });
  } catch (error) {
    console.error('Error fetching sensor station details from history database:', error);
    
    // Create mock data for development/testing
    if (process.env.NODE_ENV === 'development') {
      try {
        const { id } = await params;
        console.log(`Creating mock data for sensor station ${id} in development environment`);
        
        // Generate 24 hours of mock sensor data
        const now = Math.floor(Date.now() / 1000);
        const mockReadings = [];
        
        for (let i = 0; i < 24; i++) {
          const timestamp = now - (i * 60 * 60); // One reading per hour
          mockReadings.push({
            _id: `mock-${id}-${i}`,
            timestamp: new Date(timestamp * 1000),
            topic: `farmLab/sensorStations/${id}/Log/SensorReadings`,
            payload: {
              device_id: id,
              datetime_unix: timestamp,
              sensors: {
                air_temp_c: 20 + Math.random() * 5,
                air_humidity_percent: 60 + Math.random() * 10,
                water_temp_c: 18 + Math.random() * 4,
                water_tds_ppm: 400 + Math.random() * 100,
                gas_ppm: 0.5 + Math.random() * 1.5
              },
              source: 'mock',
              bridge: 'dev'
            }
          });
        }
        
        // Sort by datetime_unix ascending for proper chart display
        mockReadings.sort((a, b) => a.payload.datetime_unix - b.payload.datetime_unix);
        
        return NextResponse.json({
          readings: mockReadings,
          dataRange: {
            from: mockReadings[0].timestamp.toISOString(),
            to: mockReadings[mockReadings.length - 1].timestamp.toISOString(),
            count: mockReadings.length
          },
          isMock: true
        });
      } catch (mockError) {
        console.error('Error generating mock data:', mockError);
      }
    }
    
    return NextResponse.json({ error: 'Failed to fetch sensor station details' }, { status: 500 });
  }
}