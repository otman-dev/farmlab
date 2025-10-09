import clientPromise from './mongodb-cloud-client';

import type { MongoClient, Db, Collection } from 'mongodb';

export type SensorLog = {
  _id: string;
  timestamp: Date | string;
  topic: string;
  payload: Record<string, any>;
};

let dbPromise: Promise<Db> | null = null;

export async function getPreviewDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = clientPromise.then((client: MongoClient) => client.db('farmLabPreview'));
  }
  return dbPromise;
}

export async function getSensorLogsCollection(): Promise<Collection<SensorLog>> {
  const db = await getPreviewDb();
  return db.collection<SensorLog>('sensor_logs');
}

export default getSensorLogsCollection;
