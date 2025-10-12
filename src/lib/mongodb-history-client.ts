import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_CLOUD_CLUSTER_URI;

if (!uri) {
  throw new Error('Please add your MONGODB_CLOUD_CLUSTER_URI to .env.local');
}

const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoHistoryClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoHistoryClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoHistoryClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoHistoryClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export type SensorHistoryLog = {
  _id: string;
  timestamp: Date | string | number;
  topic: string;
  payload: {
    device_id: string;
    datetime_unix: number;
    sensors: Record<string, number>;
    [key: string]: any;
  };
};

let dbPromise: Promise<Db> | null = null;

export async function getHistoryDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = clientPromise.then((client: MongoClient) => client.db('farmLabPreview'));
  }
  return dbPromise;
}

export async function getSensorHistoryCollection(): Promise<Collection<SensorHistoryLog>> {
  const db = await getHistoryDb();
  return db.collection<SensorHistoryLog>('sensor_logs');
}

export default getSensorHistoryCollection;