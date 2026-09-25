import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = 'khairibo';

if (!uri) {
  console.warn('⚠️  MONGODB_URI is not set. Files will use local fallback storage.');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the value is preserved
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise && uri) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise || Promise.reject(new Error('No MongoDB URI'));
} else {
  // In production, it's best to not use a global variable.
  if (uri) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  } else {
    clientPromise = Promise.reject(new Error('No MongoDB URI'));
  }
}

export async function getDb(): Promise<Db | null> {
  try {
    const c = await clientPromise;
    return c.db(dbName);
  } catch (err) {
    console.warn('MongoDB connection failed, using local fallback:', err);
    return null;
  }
}

export default clientPromise;
