import { MongoDBConfig } from "graphql/config-loader";
import { MongoClient } from "mongodb";

export const createMongoDBClient = (config: MongoDBConfig): MongoClient => {
  const client = new MongoClient(config.MONGODB_URI);
  return client;
};
