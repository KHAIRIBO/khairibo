import { MongoClient, Db } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://Vercel-Admin-khairibosite:bCANNJCURcqdE6nf@khairibosite.b0dpds4.mongodb.net/?appName=khairibosite&compressors=zlib';

const dbName = 'khairibo';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectToMongoDB() {
  try {
    const c = await clientPromise;
    console.log('You successfully connected to MongoDB!');
    return c;
  } catch (err) {
    console.dir(err);
  }
}

export async function disconnectFromMongoDB() {
  await client.close();
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
