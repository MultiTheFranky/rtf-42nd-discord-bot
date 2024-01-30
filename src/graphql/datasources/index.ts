import { MongoClient } from "mongodb";
// eslint-disable-next-line import/no-extraneous-dependencies
import { DataSources as GqlDataSources } from "apollo-server-core/dist/graphqlOptions";
import { MongoDBDataSource, mongoDBDataSource } from "./mongoDB";

export interface DataSourcesParent {
  (mongoDB: MongoClient): GqlDataSources<DataSources>;
}

export interface DataSources {
  mongodb: MongoDBDataSource;
}

export const dataSources: DataSourcesParent = (mongoDB: MongoClient) => ({
  mongoDB: mongoDBDataSource(mongoDB),
});
