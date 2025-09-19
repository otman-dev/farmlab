import mongoose from 'mongoose';

const MONGODB_CLOUD_CLUSTER_URI = process.env.MONGODB_CLOUD_CLUSTER_URI;

if (!MONGODB_CLOUD_CLUSTER_URI) {
  throw new Error('Please define the MONGODB_CLOUD_CLUSTER_URI environment variable inside .env.local');
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = (global as { mongooseCloud?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongooseCloud as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = ((global as { mongooseCloud?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongooseCloud = { conn: null, promise: null });
}

async function dbCloudConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoCreate: true,
      autoIndex: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
  cached.promise = mongoose.connect(MONGODB_CLOUD_CLUSTER_URI as string, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB Cloud Cluster successfully');
        if (mongoose.connection.db) {
          console.log('Connected to cloud database:', mongoose.connection.db.databaseName);
        }
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB Cloud Cluster:', error);
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbCloudConnect;
