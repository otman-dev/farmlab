import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb-client';
import { publishMqttMessage } from '@/lib/mqtt-client';

// POST - Control pump (turn on/off)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, pump_id, state } = body;

    if (!device_id || !pump_id || state === undefined) {
      return NextResponse.json({ error: 'device_id, pump_id, and state are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    // Find the device
    const device = await devicesCollection.findOne({ device_id });
    if (!device) {
      return NextResponse.json({ error: 'Pump station not found' }, { status: 404 });
    }

    // Update the specific pump state in the device document
    const stateField = `${pump_id}_state`;
    await devicesCollection.updateOne(
      { device_id },
      { $set: { [stateField]: state } }
    );

    // Publish MQTT message to control topic
    const topic = `farmLab/pumpStations/${device_id}/control`;
    const payload = { pump: state };
    
    try {
      await publishMqttMessage(topic, payload);
      console.log(`[MQTT] Published to ${topic}:`, payload);
    } catch (mqttError) {
      console.error(`[MQTT] Failed to publish to ${topic}:`, mqttError);
      // Continue even if MQTT fails - DB update succeeded
    }

    return NextResponse.json({ 
      message: 'Pump control command sent',
      device_id,
      pump_id,
      state
    });
  } catch (error: any) {
    console.error('Error controlling pump:', error);
    return NextResponse.json({ error: error.message || 'Failed to control pump' }, { status: 500 });
  }
}
