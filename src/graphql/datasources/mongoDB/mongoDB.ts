import {
  Arma3Attendance,
  QueryGetArma3AttendanceArgs,
} from "graphql/__generated__/graphql";
import { DataSourceConfig } from "apollo-datasource";
import logger from "discord/logger";
import { findDocument } from "mongoDatabase";
import { MongoClient } from "mongodb";

export interface MongoDBDataSource {
  initialize: (config: DataSourceConfig<any>) => void;
  getArma3Attendance: (
    param: QueryGetArma3AttendanceArgs
  ) => Promise<Arma3Attendance | null>;
}

export const mongoDBDataSource = (client: MongoClient): MongoDBDataSource => ({
  initialize: () => {
    client.connect().then(() => {
      logger.info("Connected to MongoDB");
    });
  },
  getArma3Attendance: async (param) => {
    const { date } = param;
    const data = await findDocument<Arma3Attendance>(
      client,
      "arma3",
      "attendance",
      { date }
    );
    return data;
  },
});
