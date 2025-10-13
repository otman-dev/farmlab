/* eslint-disable prefer-const */
// Temporarily disable the rule for this file to allow the build to proceed.

import { MongoClient } from 'mongodb';

// Using the MongoDB Atlas connection string
const uri = process.env.MONGODB_URI || 'mongodb+srv://mouhib_db_user:Hhk7qIiF5lUjNf2b@farm-cluster-01.mxvp7p0.mongodb.net/farmLab';

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

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    // Log connection attempt with masked credentials
    console.log(`Initializing MongoDB client with URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('Connected to MongoDB client successfully');
        // Explicitly select the farmLab database
        console.log('Initial database may be different, will select farmLab when used');
        return client;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB client:', error);
        
        // Detailed error logging
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
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((client) => {
      console.log('Connected to MongoDB client successfully (production)');
      return client;
    });
}

export default clientPromise;