import {
  Arma3Attendance,
  QueryGetArma3AttendanceArgs,
  ResolversParentTypes,
} from "graphql/__generated__/graphql";
import { Context } from "graphql/context";

export const getArma3Attendance = async (
  _: ResolversParentTypes["Query"],
  { date }: QueryGetArma3AttendanceArgs,
  context: Context
): Promise<Arma3Attendance | null> => {
  const data = context.dataSources.mongodb.getArma3Attendance({ date });
  if (!data) {
    throw new Error("No data found");
  }
  return data;
};
