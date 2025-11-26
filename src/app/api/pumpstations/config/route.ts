import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb-client';
import { publishMqttMessage } from '@/lib/mqtt-client';

// POST - Update pump timing configuration
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, pump_id, on_time_ms, off_time_ms } = body;

    if (!device_id || !pump_id) {
      return NextResponse.json({ error: 'device_id and pump_id are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    // Find the device
    const device = await devicesCollection.findOne({ device_id });
    if (!device) {
      return NextResponse.json({ error: 'Pump station not found' }, { status: 404 });
    }

    // Update the specific pump timings in device document
    const updateFields: any = {};
    if (on_time_ms !== undefined) {
      updateFields[`${pump_id}On`] = on_time_ms;
    }
    if (off_time_ms !== undefined) {
      updateFields[`${pump_id}Off`] = off_time_ms;
    }
    
    await devicesCollection.updateOne(
      { device_id },
      { $set: updateFields }
    );

    // Publish MQTT message to config topic
    const topic = `farmLab/pumpStations/${device_id}/config`;
    const payload: any = {};
    if (on_time_ms !== undefined) payload[`${pump_id}On`] = on_time_ms;
    if (off_time_ms !== undefined) payload[`${pump_id}Off`] = off_time_ms;
    
    try {
      await publishMqttMessage(topic, payload);
      console.log(`[MQTT] Published to ${topic}:`, payload);
    } catch (mqttError) {
      console.error(`[MQTT] Failed to publish to ${topic}:`, mqttError);
      // Continue even if MQTT fails - DB update succeeded
    }

    return NextResponse.json({ 
      message: 'Pump timing configuration updated',
      device_id,
      pump_id,
      on_time_ms,
      off_time_ms
    });
  } catch (error: any) {
    console.error('Error updating pump config:', error);
    return NextResponse.json({ error: error.message || 'Failed to update pump configuration' }, { status: 500 });
  }
}
