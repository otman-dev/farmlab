import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_CLOUD_CLUSTER_URI!;
if (!uri) throw new Error("Please define the MONGODB_CLOUD_CLUSTER_URI env variable");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof global & { _mongoUsersClientPromise?: Promise<MongoClient> };
  if (!globalWithMongo._mongoUsersClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoUsersClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoUsersClientPromise!;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
