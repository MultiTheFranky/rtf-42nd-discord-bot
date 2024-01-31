import { MongoClient } from "mongodb";
// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoDBDataSource, mongoDBDataSource } from "./mongoDB";

export interface DataSourcesParent {
  (mongoDB: MongoClient): DataSources;
}

export interface DataSources {
  mongoDB: MongoDBDataSource;
}

export const dataSources: DataSourcesParent = (mongoDB: MongoClient) => ({
  mongoDB: mongoDBDataSource(mongoDB),
});
