import mqtt from 'mqtt';

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://adro.ddns.net:1883';
const MQTT_USERNAME = process.env.MQTT_USERNAME || 'rasmus';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '1843';

let client: mqtt.MqttClient | null = null;

export function getMqttClient(): mqtt.MqttClient {
  if (!client) {
    client = mqtt.connect(MQTT_BROKER_URL, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });

    client.on('connect', () => {
      console.log('MQTT Client connected to broker');
    });

    client.on('error', (err) => {
      console.error('MQTT Client error:', err);
    });

    client.on('close', () => {
      console.log('MQTT Client disconnected');
    });
  }

  return client;
}

export function publishMqttMessage(topic: string, message: string | object): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getMqttClient();
    
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to publish to ${topic}:`, err);
        reject(err);
      } else {
        console.log(`Published to ${topic}:`, payload);
        resolve();
      }
    });
  });
}

export function closeMqttClient() {
  if (client) {
    client.end();
    client = null;
  }
}
