// This file contains the API route to get comparison data for all sensor stations
import { NextRequest, NextResponse } from 'next/server';
import getSensorHistoryCollection from '@/lib/mongodb-history-client';

export async function GET(request: NextRequest) {
  try {
    console.log(`Attempting to fetch comparison data for all sensor stations...`);
    const collection = await getSensorHistoryCollection();
    
    // Get all unique sensor station IDs first
    const stationAgg = await collection.aggregate([
      {
        $match: {
          'payload.device_id': { $regex: '^sensorstation', $options: 'i' },
          topic: { $regex: /SensorReadings$/ },
          'payload.sensors': { $exists: true },
        }
      },
      {
        $group: {
          _id: '$payload.device_id',
          latest: { $max: '$payload.datetime_unix' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    const stationIds = stationAgg.map(s => s._id);
    console.log(`Found ${stationIds.length} unique sensor stations`);
    
    // Calculate timestamp for 24 hours ago (in seconds)
    const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    
    // For each station, get hourly readings for the last 24 hours
    const stationData = await Promise.all(stationIds.map(async (stationId) => {
      const readings = await collection.find({
        'payload.device_id': stationId,
        topic: { $regex: /SensorReadings$/ },
        'payload.datetime_unix': { $gte: twentyFourHoursAgo }
      })
      .sort({ 'payload.datetime_unix': 1 })
      .toArray();
      
      // Process readings to get hourly data (nearest reading to each hour)
      const hourlyData = [];
      const now = Math.floor(Date.now() / 1000);
      
      for (let i = 0; i < 24; i++) {
        const hourTimestamp = now - (i * 60 * 60);
        
        // Find reading closest to this hour
        let closestReading = null;
        let closestDiff = Infinity;
        
        for (const reading of readings) {
          const readingTime = reading.payload.datetime_unix;
          const diff = Math.abs(readingTime - hourTimestamp);
          
          if (diff < closestDiff) {
            closestReading = reading;
            closestDiff = diff;
          }
        }
        
        // If we found a reading within 2 hours of the target time
        if (closestReading && closestDiff < 7200) {
          hourlyData.push({
            timestamp: hourTimestamp,
            datetime: new Date(hourTimestamp * 1000).toISOString(),
            hour: 24 - i,
            ...closestReading.payload.sensors
          });
        }
      }
      
      return {
        stationId,
        hourlyData: hourlyData.reverse() // Reverse to get chronological order
      };
    }));
    
    return NextResponse.json({ stationData });
  } catch (error) {
    console.error('Error fetching sensor stations comparison data:', error);
    
    // Create mock data for development/testing
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating mock comparison data for sensor stations');
      
      // Generate 24 hours of mock sensor data for 3 stations
      const mockStationIds = ['sensorstation01', 'sensorstation02', 'sensorstation03'];
      const now = Math.floor(Date.now() / 1000);
      const mockStationData = mockStationIds.map(stationId => {
        const hourlyData = [];
        
        for (let i = 0; i < 24; i++) {
          const hourTimestamp = now - ((23-i) * 60 * 60); // Start from 24 hours ago
          
          // Create realistic but varying mock data for each station
          let baseTemp = 20;
          let baseHumidity = 60;
          
          // Add variation based on station ID
          if (stationId === 'sensorstation01') {
            baseTemp += 2;
            baseHumidity -= 5;
          } else if (stationId === 'sensorstation03') {
            baseTemp -= 1;
            baseHumidity += 8;
          }
          
          // Add time-based variation (warmer during day, cooler at night)
          const hourOfDay = new Date(hourTimestamp * 1000).getHours();
          const isDaytime = hourOfDay >= 8 && hourOfDay <= 18;
          const timeVariation = isDaytime ? 2 : -1;
          
          // Add random noise
          const tempNoise = Math.random() * 1.5 - 0.75;
          const humidityNoise = Math.random() * 4 - 2;
          
          hourlyData.push({
            timestamp: hourTimestamp,
            datetime: new Date(hourTimestamp * 1000).toISOString(),
            hour: i + 1,
            air_temp_c: baseTemp + timeVariation + tempNoise,
            air_humidity_percent: baseHumidity + (isDaytime ? -3 : 5) + humidityNoise,
            water_temp_c: baseTemp - 1 + Math.random() * 1 - 0.5,
            water_tds_ppm: 400 + Math.random() * 50 - 25,
            gas_ppm: 0.5 + Math.random() * 0.4 - 0.2
          });
        }
        
        return {
          stationId,
          hourlyData
        };
      });
      
      return NextResponse.json({ 
        stationData: mockStationData,
        isMock: true 
      });
    }
    
    return NextResponse.json({ error: 'Failed to fetch sensor stations comparison data' }, { status: 500 });
  }
}