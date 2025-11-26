import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb-client';

// Helper to normalize boolean values
function normalizeBool(v: any): boolean {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    return ['true', '1', 'yes', 'on'].includes(v.toLowerCase());
  }
  if (typeof v === 'number') return v !== 0;
  return false;
}

// Helper to map device document to pump station format
function mapDeviceToPumpStation(device: any) {
  const pumps = [];
  
  // Map pump1 - only if it has timing data
  if (device.pump1On !== undefined || device.pump1_on !== undefined || device.pump1on !== undefined) {
    pumps.push({
      pump_id: 'pump1',
      pin: device.pump1_pin ?? device.pin1 ?? 1,
      state: normalizeBool(device.pump1_state ?? device.pump1state ?? device.pump1),
      on_time_ms: Number(device.pump1On ?? device.pump1_on ?? device.pump1on ?? 1000),
      off_time_ms: Number(device.pump1Off ?? device.pump1_off ?? device.pump1off ?? 10000),
    });
  }
  
  // Map pump2 - only if it has timing data
  if (device.pump2On !== undefined || device.pump2_on !== undefined || device.pump2on !== undefined) {
    pumps.push({
      pump_id: 'pump2',
      pin: device.pump2_pin ?? device.pin2 ?? 2,
      state: normalizeBool(device.pump2_state ?? device.pump2state ?? device.pump2),
      on_time_ms: Number(device.pump2On ?? device.pump2_on ?? device.pump2on ?? 1000),
      off_time_ms: Number(device.pump2Off ?? device.pump2_off ?? device.pump2off ?? 10000),
    });
  }

  return {
    _id: device._id,
    device_id: device.device_id,
    name: device.name || `Pump Station (${device.device_id})`,
    bridge: device.bridge ?? 'rasp_01',
    fw: device.fw ?? null,
    last_seen: device.last_seen || device.lastSeen || null,
    mqtt: device.mqtt === undefined ? true : normalizeBool(device.mqtt),
    automation_enabled: normalizeBool(device.automation ?? device.automation_enabled),
    status: {
      wifi: normalizeBool(device.wifi),
      uptime: device.uptime ?? device.uptime_seconds ?? null,
    },
    datetime_unix: device.datetime_unix ?? null,
    pumps,
  };
}

// GET - List all pump stations from devices collection
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    // Find all devices where device_id starts with "pump"
    const deviceDocs = await devicesCollection
      .find({ device_id: { $regex: /^pump/i } })
      .sort({ device_id: 1 })
      .toArray();
    
    const stations = deviceDocs.map(mapDeviceToPumpStation);
    
    return NextResponse.json({ pumpStations: stations });
  } catch (error: any) {
    console.error('Error fetching pump stations:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch pump stations' }, { status: 500 });
  }
}

// POST - Create new pump station (creates device document)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, name, bridge } = body;

    if (!device_id) {
      return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    // Check if device already exists
    const existing = await devicesCollection.findOne({ device_id });
    if (existing) {
      return NextResponse.json({ error: 'Pump station with this device_id already exists' }, { status: 400 });
    }

    const newDevice = {
      device_id,
      name: name || `Pump Station (${device_id})`,
      bridge: bridge || 'rasp_01',
      pump1On: 8000,
      pump1Off: 2000,
      pump1_state: false,
      automation: false,
      mqtt: false,
      wifi: false,
      uptime: 0,
      last_seen: new Date(),
    };

    await devicesCollection.insertOne(newDevice);

    return NextResponse.json({ pumpStation: newDevice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pump station:', error);
    return NextResponse.json({ error: error.message || 'Failed to create pump station' }, { status: 500 });
  }
}

// PUT - Update pump station (updates device document)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, name, bridge, automation } = body;

    if (!device_id) {
      return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bridge !== undefined) updateData.bridge = bridge;
    if (automation !== undefined) updateData.automation = automation;

    const result = await devicesCollection.findOneAndUpdate(
      { device_id },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Pump station not found' }, { status: 404 });
    }

    return NextResponse.json({ pumpStation: mapDeviceToPumpStation(result) });
  } catch (error: any) {
    console.error('Error updating pump station:', error);
    return NextResponse.json({ error: error.message || 'Failed to update pump station' }, { status: 500 });
  }
}

// DELETE - Delete pump station (removes device document)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const device_id = searchParams.get('device_id');

    if (!device_id) {
      return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    const result = await devicesCollection.deleteOne({ device_id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Pump station not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pump station deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting pump station:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete pump station' }, { status: 500 });
  }
}
