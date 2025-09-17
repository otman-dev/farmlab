/* eslint-disable prefer-const */
// Temporarily disable the rule for this file to allow the build to proceed.

import { MongoClient } from 'mongodb';

// Using the connection string with auth source parameter and farmLab database
const uri = process.env.MONGODB_URI || 'mongodb://rasmus:wordpiss@adro.ddns.net:27017/farmLab?authSource=admin';

// Log the actual URI being used (with credentials masked)
console.log(`MONGODB_URI from env or default in mongodb-client.ts: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  // Log connection attempt with masked credentials
  console.log(`Initializing MongoDB client with URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect()
    .then((client) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Connected to MongoDB client successfully');
        console.log('Initial database may be different, will select farmLab when used');
      } else {
        console.log('Connected to MongoDB client successfully (production)');
      }
      return client;
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB client:', error);
      if (error.code === 18 || error.codeName === 'AuthenticationFailed') {
        console.error('MongoDB Authentication Failed - Please check your credentials');
      } else if (error.name === 'MongoTimeoutError') {
        console.error('MongoDB Connection Timeout - Server may be down or unreachable');
      } else if (error.name === 'MongoNetworkError') {
        console.error('MongoDB Network Error - Check network connectivity or firewall settings');
      }
      throw error;
    });
}
clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;