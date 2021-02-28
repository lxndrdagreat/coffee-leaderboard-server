import { MongoClient, Db } from 'mongodb';
import type { Collection } from 'mongodb';
import {
  databaseURL,
  databaseName,
  databaseUser,
  databasePassword
} from '../config/config';

export function createClient(): MongoClient {
  return new MongoClient(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
      user: databaseUser,
      password: databasePassword
    }
  });
}

const client = createClient();
let connectedDb: Db;

export async function getConnectedDb(): Promise<Db> {
  if (!connectedDb) {
    await client.connect();
    connectedDb = client.db(databaseName);
  }
  return connectedDb;
}

export async function getCollection<CollectionSchema>(
  collectionName: string
): Promise<Collection<CollectionSchema>> {
  const db = await getConnectedDb();
  return db.collection<CollectionSchema>(collectionName);
}
