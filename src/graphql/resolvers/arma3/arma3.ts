import {
  Arma3Attendance,
  QueryGetArma3AttendanceArgs,
  ResolversParentTypes,
} from "graphql/__generated__/graphql";
import { Context } from "graphql/context";

export const getArma3Attendance = async (
  _: ResolversParentTypes["Query"],
  { filter }: QueryGetArma3AttendanceArgs,
  context: Context
): Promise<Arma3Attendance | null> => {
  const data = await context.dataSources.mongoDB.getArma3Attendance({ filter });
  return data;
};
