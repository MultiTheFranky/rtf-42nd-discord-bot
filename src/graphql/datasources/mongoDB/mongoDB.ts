import {
  Arma3Attendance,
  Arma3AttendanceInput,
  QueryGetArma3AttendanceArgs,
} from "graphql/__generated__/graphql";
import { DataSourceConfig } from "apollo-datasource";
import logger from "discord/logger";
import { findDocument, updateDocument, writeDocument } from "mongoDatabase";
import { MongoClient, ObjectId } from "mongodb";
import { Arma3Attendance as Arma3AttendanceModel } from "mongoDatabase/models/arma3";

export interface MongoDBDataSource {
  initialize: (config: DataSourceConfig<any>) => void;
  getArma3Attendance: (
    param: QueryGetArma3AttendanceArgs
  ) => Promise<Arma3Attendance>;
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
    const data = await findDocument<Arma3Attendance>(
      client,
      "arma3",
      "attendance",
      { date }
    );
    if (!data) return { date, attendance: [] } as Arma3Attendance;
    return data;
  },
  addArma3Attendance: async (input) => {
    const { date, attendance } = input;
    const existingData = await findDocument<Arma3AttendanceModel>(
      client,
      "arma3",
      "attendance",
      { date }
    );

    if (existingData) {
      logger.info("Updating existing attendance");
      await updateDocument(
        client,
        "arma3",
        "attendance",
        { date },
        {
          $set: {
            attendance: existingData.attendance.concat(attendance),
          },
        }
      );
      return { date, attendance };
    }

    logger.info("Creating new attendance");
    await writeDocument<Arma3AttendanceModel>(client, "arma3", "attendance", {
      _id: new ObjectId(),
      date,
      attendance,
    });

    return { date, attendance };
  },
});
