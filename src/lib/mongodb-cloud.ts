
import mongoose, { Connection, Model } from 'mongoose';
import UserSchema, { User } from '@/models/User';

const MONGODB_CLOUD_CLUSTER_URI = process.env.MONGODB_CLOUD_CLUSTER_URI;

if (!MONGODB_CLOUD_CLUSTER_URI) {
  throw new Error('Please define the MONGODB_CLOUD_CLUSTER_URI environment variable inside .env.local');
}

type CloudCache = { conn: Connection | null; promise: Promise<Connection> | null; userModel?: Model<User> };
let cachedCloud: CloudCache = (global as unknown as { mongooseCloud?: CloudCache }).mongooseCloud as CloudCache;
if (!cachedCloud) {
  cachedCloud = ((global as unknown as { mongooseCloud?: CloudCache }).mongooseCloud = { conn: null, promise: null });
}

export async function getCloudConnection() {
  if (cachedCloud.conn) return cachedCloud.conn;
  if (!cachedCloud.promise) {
  cachedCloud.promise = mongoose.createConnection(MONGODB_CLOUD_CLUSTER_URI as string, {
      bufferCommands: false,
      autoCreate: true,
      autoIndex: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
      .asPromise()
      .then((conn) => {
        console.log('Connected to MongoDB Cloud Cluster successfully');
        return conn;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB Cloud Cluster:', error);
        throw error;
      });
  }

  cachedCloud.conn = await cachedCloud.promise;
  return cachedCloud.conn;
}

export async function getCloudUserModel(): Promise<Model<User>> {
  const conn = await getCloudConnection();
  if (!cachedCloud.userModel) {
    cachedCloud.userModel = conn.models.User || conn.model<User>('User', UserSchema.schema || UserSchema);
  }
  return cachedCloud.userModel;
}
