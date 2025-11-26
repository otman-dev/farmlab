import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import clientPromise from '@/lib/mongodb-client';
import { publishMqttMessage } from '@/lib/mqtt-client';

// POST - Toggle automation on/off
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, automation_enabled } = body;

    if (!device_id || automation_enabled === undefined) {
      return NextResponse.json({ error: 'device_id and automation_enabled are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('farmLab');
    const devicesCollection = db.collection('devices');
    
    const result = await devicesCollection.updateOne(
      { device_id },
      { $set: { automation: automation_enabled } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Pump station not found' }, { status: 404 });
    }

    // Publish MQTT message to control topic
    const topic = `farmLab/pumpStations/${device_id}/control`;
    const payload = { automation: automation_enabled };
    
    try {
      await publishMqttMessage(topic, payload);
      console.log(`[MQTT] Published to ${topic}:`, payload);
    } catch (mqttError) {
      console.error(`[MQTT] Failed to publish to ${topic}:`, mqttError);
      // Continue even if MQTT fails - DB update succeeded
    }

    return NextResponse.json({ 
      message: `Automation ${automation_enabled ? 'enabled' : 'disabled'}`,
      device_id,
      automation_enabled
    });
  } catch (error: any) {
    console.error('Error toggling automation:', error);
    return NextResponse.json({ error: error.message || 'Failed to toggle automation' }, { status: 500 });
  }
}
