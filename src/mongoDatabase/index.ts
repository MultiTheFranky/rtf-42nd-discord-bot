import { Collection, MongoClient } from "mongodb";
import { Arma3Attendance } from "./models/arma3";

export type Database = keyof typeof dbAndCollection;
export type CollectionName = keyof typeof dbAndCollection[Database];

export const dbAndCollection = {
  arma3: {
    attendance: Collection<Arma3Attendance>,
  },
};

export const connectToDatabase = async (client: MongoClient, db: Database) => {
  await client.connect();
  return client.db(db);
};

export const getCollection = async <T extends Document>(
  client: MongoClient,
  db: Database,
  collection: CollectionName
) => {
  const database = await connectToDatabase(client, db);
  return database.collection<T>(collection);
};

export const findDocument = async <T>(
  client: MongoClient,
  db: Database,
  collection: CollectionName,
  query: any
): Promise<T> => {
  const database = await connectToDatabase(client, db);
  return database.collection(collection).findOne(query) as Promise<T>;
};

export const findDocuments = async <T>(
  client: MongoClient,
  db: Database,
  collection: CollectionName,
  query: any
): Promise<T[]> => {
  const database = await connectToDatabase(client, db);
  return database.collection(collection).find(query).toArray() as Promise<T[]>;
};
