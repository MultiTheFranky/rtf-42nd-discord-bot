import {
  Arma3Attendance,
  Arma3AttendanceInput,
  QueryGetArma3AttendanceArgs,
} from "graphql/__generated__/graphql";
import { DataSourceConfig } from "apollo-datasource";
import logger from "discord/logger";
import { findDocuments, writeDocument } from "mongoDatabase";
import { MongoClient, ObjectId } from "mongodb";
import { Arma3Attendance as Arma3AttendanceModel } from "mongoDatabase/models/arma3";

export interface MongoDBDataSource {
  initialize: (config: DataSourceConfig<any>) => void;
  getArma3Attendance: (
    param: QueryGetArma3AttendanceArgs
  ) => Promise<Arma3Attendance[] | null>;
  addArma3Attendance: (
    input: Arma3AttendanceInput
  ) => Promise<Arma3Attendance | null>;
}

export const mongoDBDataSource = (client: MongoClient): MongoDBDataSource => ({
  initialize: () => {
    logger.info("Connecting to MongoDB");
    client.connect().then(() => {
      logger.info("Connected to MongoDB");
    });
  },
  getArma3Attendance: async (param) => {
    const { date } = param.filter;
    const data = await findDocuments<Arma3Attendance>(
      client,
      "arma3",
      "attendance",
      { date }
    );
    return data;
  },
  addArma3Attendance: async (input) => {
    const { date, attendance } = input;
    try {
      await writeDocument<Arma3AttendanceModel>(client, "arma3", "attendance", {
        _id: new ObjectId(),
        date,
        attendance,
      });
    } catch (error) {
      return null;
    }
    return { date, attendance };
  },
});
