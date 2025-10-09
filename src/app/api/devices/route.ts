/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporarily disable these rules for this file to allow the build to proceed.

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import getSensorLogsCollection from '@/lib/mongodb-preview-client';

// Get the Device model
const getDeviceModel = () => {
  const DeviceModel = require('@/models/Device').default;
  return DeviceModel;
};

export async function GET() {
  try {
    // Connect to the database
    console.log('Connecting to MongoDB to fetch devices...');
    await dbConnect();
    console.log('Connected to MongoDB successfully');
    
    // Log database name for debugging
    console.log('Using database:', mongoose.connection.db?.databaseName || 'unknown');
    
    // Get the Device model
    const Device = getDeviceModel();
    
    // Fetch all devices, sorted by last_seen (most recent first)
    const devicesRaw = await Device.find({}).sort({ last_seen: -1 });

    const processed = (devicesRaw || []).map((d: any) => {
      const obj = d.toJSON ? d.toJSON() : d;

      // Normalize last_seen if present
      if (obj.last_seen) {
        try {
          const ls = new Date(obj.last_seen);
          obj.last_seen = isNaN(ls.getTime()) ? undefined : ls.toISOString();
        } catch (e) {
          obj.last_seen = undefined;
        }
      }

      // Infer type if missing
      if (!obj.device_type && !obj.type) {
        const id = obj.device_id || '';
        if (/^sensorstation/i.test(id)) {
          obj.device_type = 'sensorStation';
          obj.type = 'sensorStation';
        } else if (/security/i.test(id)) {
          obj.device_type = 'securitySystem';
          obj.type = 'securitySystem';
        } else {
          obj.device_type = obj.device_type || 'unknown';
          obj.type = obj.type || 'unknown';
        }
      }

      // Compute status if missing
      if (!obj.status || obj.status === 'unknown') {
        if (obj.device_id === 'securitySystem01') obj.status = 'maintenance';
        else if (obj.last_seen) {
          const lastSeenTs = new Date(obj.last_seen).getTime() / 1000;
          const nowTs = Date.now() / 1000;
          obj.status = (nowTs - lastSeenTs) <= 5 * 60 ? 'online' : 'offline';
        } else obj.status = 'unknown';
      }

    return obj;
    });

    return NextResponse.json(processed);
  } catch (error: any) {
    console.error('Error fetching devices (primary):', error);
    // Fallback: read distinct devices from preview sensor_logs
    try {
      const collection = await getSensorLogsCollection();
      const agg = await collection.aggregate([
        { $match: { 'payload.device_id': { $exists: true } } },
        { $sort: { timestamp: -1 } },
        { $group: { _id: '$payload.device_id', doc: { $first: '$$ROOT' } } },
      ]).toArray();

      const devices = (agg || []).map((d: any) => {
        const deviceId = d._id;
        const payload = d.doc?.payload || {};
        const lastSeenRaw = d.doc?.timestamp || payload.timestamp;
        const lastSeenTs = lastSeenRaw ? (new Date(lastSeenRaw).getTime() / 1000) : null;
        const nowTs = Date.now() / 1000;
        let inferredType = payload.device_type || 'unknown';
        if (inferredType === 'unknown') {
          if (/^sensorstation/i.test(deviceId)) inferredType = 'sensorStation';
          else if (/security/i.test(deviceId)) inferredType = 'securitySystem';
        }

        const status = deviceId === 'securitySystem01' ? 'maintenance' : (lastSeenTs ? ((nowTs - lastSeenTs) <= 5 * 60 ? 'online' : 'offline') : 'unknown');

        return {
          device_id: deviceId,
          name: payload.device_id || d.doc?.name || `Device ${deviceId}`,
          device_type: inferredType,
          type: inferredType,
          status,
          last_seen: lastSeenTs ? new Date(lastSeenTs * 1000).toISOString() : undefined,
        };
      });

      return NextResponse.json(devices);
    } catch (fallbackErr) {
      console.error('Fallback devices fetch failed:', fallbackErr);
      return NextResponse.json({ error: error.message || 'Failed to fetch devices', fallbackError: String(fallbackErr) }, { status: 500 });
    }
  }
}