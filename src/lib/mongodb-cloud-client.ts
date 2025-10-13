import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_CLOUD_CLUSTER_URI || 'mongodb+srv://mouhib_db_user:Hhk7qIiF5lUjNf2b@farm-cluster-01.mxvp7p0.mongodb.net/farmLab';

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
    _mongoCloudClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoCloudClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoCloudClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoCloudClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
