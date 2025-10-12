import { NextResponse } from 'next/server';
import getSensorHistoryCollection from '@/lib/mongodb-history-client';

export async function GET() {
  try {
    console.log('Attempting to fetch sensor stations from farmLabPreview database...');
    const collection = await getSensorHistoryCollection();

    // Aggregate latest log per sensor station based on payload.device_id
    // Specifically target SensorReadings documents to get sensor data
    const agg = await collection
      .aggregate([
        { 
          $match: { 
            'payload.device_id': { $regex: '^sensorstation', $options: 'i' },
            'topic': { $regex: /SensorReadings$/ }, // Only get sensor reading documents
            'payload.datetime_unix': { $exists: true } // Ensure datetime_unix exists
          }
        },
        { $sort: { 'payload.datetime_unix': -1 } }, // Sort by datetime_unix instead of timestamp
        { $group: { _id: '$payload.device_id', doc: { $first: '$$ROOT' } } },
      ])
      .toArray();

    console.log(`Successfully retrieved ${agg.length} sensor stations from history database`);
    const sensorStations = agg.map((g) => ({ device_id: g._id, latest: g.doc }));
    return NextResponse.json({ sensorStations });
  } catch (error) {
    console.error('Error fetching sensor station logs from history database:', error);
    
    // Generate mock data if we're in development mode
    try {
      console.log('Creating mock data for sensor stations...');
      
      // Create mock data for development/testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating mock data for development environment');
        const mockStations = [
          {
            device_id: 'sensorstation01',
            latest: {
              _id: 'mock-id-01',
              timestamp: new Date(),
              topic: 'farmLab/sensorStations/sensorstation01/Log/SensorReadings',
              payload: {
                device_id: 'sensorstation01',
                datetime_unix: Math.floor(Date.now() / 1000),
                sensors: {
                  air_temp_c: 22.5,
                  air_humidity_percent: 65.2,
                  water_temp_c: 19.8,
                  water_tds_ppm: 450,
                  gas_ppm: 0.8
                },
                source: 'mock',
                bridge: 'dev'
              }
            }
          },
          {
            device_id: 'sensorstation02',
            latest: {
              _id: 'mock-id-02',
              timestamp: new Date(),
              topic: 'farmLab/sensorStations/sensorstation02/Log/SensorReadings',
              payload: {
                device_id: 'sensorstation02',
                datetime_unix: Math.floor(Date.now() / 1000),
                sensors: {
                  air_temp_c: 23.1,
                  air_humidity_percent: 62.8,
                  water_temp_c: 20.2,
                  water_tds_ppm: 425,
                  gas_ppm: 1.2
                },
                source: 'mock',
                bridge: 'dev'
              }
            }
          }
        ];
        return NextResponse.json({ sensorStations: mockStations });
      }
      
      console.error('Database connection failed');
      return NextResponse.json({ error: 'Failed to fetch sensor station logs' }, { status: 500 });
    } catch (innerError) {
      console.error('Error creating mock data:', innerError);
      return NextResponse.json({ error: 'Failed to fetch sensor station logs' }, { status: 500 });
    }
  }
}
