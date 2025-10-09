/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporarily disable these rules for this file to allow the build to proceed.

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import getSensorLogsCollection from '@/lib/mongodb-preview-client';

// Define a type for logs that might be in different formats
interface DeviceLog {
  timestamp?: Date | string | number;
  message?: string;
  level?: string;
  [key: string]: any; // For other fields that might be in the logs
}

// Get the Device model
const getDeviceModel = () => {
  const DeviceModel = require('@/models/Device').default;
  return DeviceModel;
};


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Safely extract the id parameter
  const { id: deviceId } = await context.params;

  try {
    // Connect to the database
    console.log(`Connecting to MongoDB to fetch device with ID: ${deviceId}...`);
    await dbConnect();
    console.log('Connected to MongoDB successfully');

    // Log database name for debugging
    console.log('Using database:', mongoose.connection.db?.databaseName || 'unknown');

    // Get the Device model
    const Device = getDeviceModel();

    // Find the device by device_id
    const device = await Device.findOne({ device_id: deviceId });

    if (!device) {
      console.log(`Device with ID ${deviceId} not found in primary DB, attempting preview fallback`);
      // Fallback: attempt to get latest doc from preview sensor_logs
      try {
        const collection = await getSensorLogsCollection();
        const doc = await collection.find({ 'payload.device_id': deviceId }).sort({ timestamp: -1 }).limit(1).toArray();
        if (doc && doc[0]) {
          const payload = doc[0].payload || {};
          const lastSeen = doc[0].timestamp || payload.timestamp;
          const deviceObj = {
            _id: doc[0]._id,
            device_id: deviceId,
            name: payload.device_id || `Device ${deviceId}`,
            type: payload.device_type || (deviceId.startsWith('sensorstation') ? 'sensorStation' : 'unknown'),
            device_type: payload.device_type || (deviceId.startsWith('sensorstation') ? 'sensorStation' : 'unknown'),
            status: deviceId === 'securitySystem01' ? 'maintenance' : 'unknown',
            last_seen: lastSeen ? new Date(lastSeen).toISOString() : undefined,
            source: payload.source,
            bridge: payload.bridge,
          };

          // also fetch recent logs from preview collection
          const logsRaw = await collection.find({ 'payload.device_id': deviceId }).sort({ timestamp: -1 }).limit(20).toArray();
          const logs = logsRaw.map((l: any) => ({ ...l }));

          return NextResponse.json({ device: deviceObj, logs });
        }
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
      } catch (fallbackErr) {
        console.error('Preview fallback failed for device detail:', fallbackErr);
        return NextResponse.json({ error: 'Device not found' }, { status: 404 });
      }
    }

    console.log(`Found device: ${device.device_id}`);

    // Process device to ensure it has all required fields
    const deviceObj = device.toJSON();

    // Ensure device has a name
    if (!deviceObj.name) {
      deviceObj.name = `Device ${deviceObj.device_id}`;
    }

    // Ensure device has a type
    if (!deviceObj.type) {
      deviceObj.type = deviceObj.device_type || 'unknown';
    }

    // Ensure device has a status
    if (!deviceObj.status) {
      deviceObj.status = 'unknown';
    }

    // Get recent logs for this device from its specific collection
    // The collection name is based on the device_id + _logs
    const logCollectionName = `${deviceId}_logs`;

    let logs: DeviceLog[] = [];
    try {
      // Check if the connection.db is defined
      if (mongoose.connection.db) {
        // Check if the collection exists
        const collections = await mongoose.connection.db.listCollections({ name: logCollectionName }).toArray();

        if (collections.length > 0) {
          console.log(`Found logs collection: ${logCollectionName}`);
          // Get the most recent 20 logs
          const rawLogs = await mongoose.connection.db.collection(logCollectionName)
            .find({})
            .sort({ timestamp: -1 })
            .limit(20)
            .toArray();

          // Convert MongoDB documents to our expected format
          logs = rawLogs.map(log => {
            // Cast to unknown first to prevent TypeScript errors
            const typedLog = log as unknown as DeviceLog;
            return typedLog;
          });

          console.log(`Found ${logs.length} logs for device ${deviceId}`);
        } else {
          console.log(`No logs collection found for device ${deviceId}`);
        }
      } else {
        console.log('MongoDB connection is not initialized properly');
      }
    } catch (logError) {
      console.error(`Error fetching logs for device ${deviceId}:`, logError);
      // Continue with the request even if logs can't be fetched
    }

    // Return the device details and logs
    return NextResponse.json({
      device: deviceObj,
      logs
    });
  } catch (error: unknown) {
    // Safely accessing deviceId here since it's declared at the top level
    console.error(`Error fetching device ${deviceId}:`, error);
    // As a final attempt, try preview fallback if primary fails entirely
    try {
      const collection = await getSensorLogsCollection();
      const doc = await collection.find({ 'payload.device_id': deviceId }).sort({ timestamp: -1 }).limit(1).toArray();
      if (doc && doc[0]) {
        const payload = doc[0].payload || {};
        const lastSeen = doc[0].timestamp || payload.timestamp;
        const deviceObj = {
          _id: doc[0]._id,
          device_id: deviceId,
          name: payload.device_id || `Device ${deviceId}`,
          type: payload.device_type || (deviceId.startsWith('sensorstation') ? 'sensorStation' : 'unknown'),
          device_type: payload.device_type || (deviceId.startsWith('sensorstation') ? 'sensorStation' : 'unknown'),
          status: deviceId === 'securitySystem01' ? 'maintenance' : 'unknown',
          last_seen: lastSeen ? new Date(lastSeen).toISOString() : undefined,
          source: payload.source,
          bridge: payload.bridge,
        };

        const logsRaw = await collection.find({ 'payload.device_id': deviceId }).sort({ timestamp: -1 }).limit(20).toArray();
        const logs = logsRaw.map((l: any) => ({ ...l }));
        return NextResponse.json({ device: deviceObj, logs });
      }
    } catch (fallbackErr) {
      console.error('Final preview fallback failed:', fallbackErr);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch device details' },
      { status: 500 }
    );
  }
}