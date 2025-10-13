import RegistrationResponseModel from '@/models/RegistrationResponse';

export async function getCloudRegistrationResponseModel() {
  const conn = await getCloudConnection();
  // Use the model from the connection if available, else fallback
  return conn.models.RegistrationResponse || conn.model('RegistrationResponse', RegistrationResponseModel.schema);
}

import mongoose, { Connection, Model } from 'mongoose';
import UserModel, { User } from '@/models/User';

const MONGODB_CLOUD_CLUSTER_URI = process.env.MONGODB_CLOUD_CLUSTER_URI || 'mongodb+srv://mouhib_db_user:Hhk7qIiF5lUjNf2b@farm-cluster-01.mxvp7p0.mongodb.net/farmLab';

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
    // Try to extract direct connection string parts if SRV fails
    // This is a fallback mechanism for DNS resolution issues
    const directConnectionString = createDirectConnectionStringFromSRV(MONGODB_CLOUD_CLUSTER_URI as string);

    // First attempt with original connection string
    cachedCloud.promise = mongoose.createConnection(MONGODB_CLOUD_CLUSTER_URI as string, {
      bufferCommands: false,
      autoCreate: true,
      autoIndex: true,
      connectTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000, // Added server selection timeout
      family: 4, // Force IPv4 to avoid IPv6 DNS issues
      // Retry behavior for transient errors
      retryWrites: true,
      retryReads: true,
    })
      .asPromise()
      .then((conn) => {
        console.log('Connected to MongoDB Cloud Cluster successfully');
        return conn;
      })
      .catch(async (error) => {
        console.error('Error connecting to MongoDB Cloud Cluster:', error);
        
        // Detailed error logging
        if (error.code === 'ESERVFAIL' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          console.error('DNS resolution failed for MongoDB Atlas cluster. This could be due to:');
          console.error('1. Network connectivity issues');
          console.error('2. DNS server problems');
          console.error('3. Firewall blocking MongoDB Atlas');
          console.error('4. Temporary MongoDB Atlas service issues');
          console.error('Attempting fallback direct connection...');
          
          // Fallback to direct connection if available
          if (directConnectionString) {
            console.log('Trying direct connection to MongoDB Atlas');
            try {
              // Try direct connection as fallback
              const conn = await mongoose.createConnection(directConnectionString, {
                bufferCommands: false,
                autoCreate: true,
                autoIndex: true,
                connectTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                family: 4,
              }).asPromise();
              
              console.log('Connected to MongoDB Cloud Cluster using direct connection');
              return conn;
            } catch (directError) {
              console.error('Direct connection to MongoDB failed:', directError);
              throw directError; // Re-throw if direct connection also fails
            }
          }
        }
        
        throw error; // Re-throw the original error if no fallback is available
      });
  }

  try {
    cachedCloud.conn = await cachedCloud.promise;
    return cachedCloud.conn;
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', error);
    // Reset the promise so next call will try again
    cachedCloud.promise = null;
    throw error;
  }
}

// Helper function to create a direct connection string from SRV format
// This is used as a fallback when SRV DNS resolution fails
function createDirectConnectionStringFromSRV(srv: string): string | null {
  try {
    // Try to extract cluster info from the SRV URI
    // Format: mongodb+srv://username:password@cluster-name.mongodb.net/dbname?options
    const match = srv.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)(\?.*)?/);
    
    if (match) {
      const [_, username, password, host, dbName, options] = match;
      // For farm-cluster-01.mxvp7p0.mongodb.net, we'll use farm-cluster-01-shard-00-00.mxvp7p0.mongodb.net:27017
      // This is a common MongoDB Atlas pattern for the first shard
      const hostParts = host.split('.');
      if (hostParts.length >= 3) {
        const clusterName = hostParts[0];
        const remainder = hostParts.slice(1).join('.');
        const directHost = `${clusterName}-shard-00-00.${remainder}`;
        
        // Build direct connection string with SSL enabled (required for Atlas)
        return `mongodb://${username}:${password}@${directHost}:27017/${dbName}?ssl=true&authSource=admin&replicaSet=${clusterName}${options || ''}`;
      }
    }
    return null;
  } catch (e) {
    console.error('Failed to create direct connection string:', e);
    return null;
  }
}

export async function getCloudUserModel(): Promise<Model<User>> {
  const conn = await getCloudConnection();
  if (!cachedCloud.userModel) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cachedCloud.userModel = (conn.models.User || conn.model<User>('User', UserModel.schema)) as any;
  }
  return cachedCloud.userModel;
}
