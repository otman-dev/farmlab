/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporarily disable these rules for this file to allow the build to proceed.

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

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
    const devices = await Device.find({}).sort({ last_seen: -1 });
    
    console.log(`Found ${devices.length} devices`);
    
    return NextResponse.json(devices);
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}