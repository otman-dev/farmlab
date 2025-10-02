import RegistrationResponseModel from '@/models/RegistrationResponse';

export async function getCloudRegistrationResponseModel() {
  const conn = await getCloudConnection();
  // Use the model from the connection if available, else fallback
  return conn.models.RegistrationResponse || conn.model('RegistrationResponse', RegistrationResponseModel.schema);
}

import mongoose, { Connection, Model } from 'mongoose';
import UserModel, { User } from '@/models/User';

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
      connectTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000, // Added server selection timeout
      family: 4, // Force IPv4 to avoid IPv6 DNS issues
    })
      .asPromise()
      .then((conn) => {
        console.log('Connected to MongoDB Cloud Cluster successfully');
        return conn;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB Cloud Cluster:', error);
        
        // Log detailed error information
        if (error.code === 'ESERVFAIL' || error.code === 'ENOTFOUND') {
          console.error('DNS resolution failed for MongoDB Atlas cluster. This could be due to:');
          console.error('1. Network connectivity issues');
          console.error('2. DNS server problems');
          console.error('3. Firewall blocking MongoDB Atlas');
          console.error('4. Temporary MongoDB Atlas service issues');
        }
        
        throw error;
      });
  }

  cachedCloud.conn = await cachedCloud.promise;
  return cachedCloud.conn;
}

export async function getCloudUserModel(): Promise<Model<User>> {
  const conn = await getCloudConnection();
  if (!cachedCloud.userModel) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cachedCloud.userModel = (conn.models.User || conn.model<User>('User', UserModel.schema)) as any;
  }
  return cachedCloud.userModel;
}
