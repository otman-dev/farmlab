import mongoose from 'mongoose';

const uri = process.env.MONGODB_CLOUD_CLUSTER_URI;
if (!uri) throw new Error('Please add your MONGODB_CLOUD_CLUSTER_URI to .env.local');

let connPromise: Promise<mongoose.Connection>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongoose = global as typeof globalThis & {
    _mongooseCloudConnPromise?: Promise<mongoose.Connection>;
  };
  if (!globalWithMongoose._mongooseCloudConnPromise) {
    globalWithMongoose._mongooseCloudConnPromise = mongoose.createConnection(uri).asPromise();
  }
  connPromise = globalWithMongoose._mongooseCloudConnPromise;
} else {
  connPromise = mongoose.createConnection(uri).asPromise();
}

export default connPromise;
