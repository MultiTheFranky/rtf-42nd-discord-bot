import {
  Arma3Attendance,
  MutationAddArma3AttendanceArgs,
  QueryGetArma3AttendanceArgs,
  ResolversParentTypes,
} from "graphql/__generated__/graphql";
import { Context } from "graphql/context";

export const addArma3Attendance = async (
  _: ResolversParentTypes["Mutation"],
  { input }: MutationAddArma3AttendanceArgs,
  context: Context
): Promise<Arma3Attendance | null> => {
  const data = await context.dataSources.mongoDB.addArma3Attendance(input);
  return data;
};

export const getArma3Attendance = async (
  _: ResolversParentTypes["Query"],
  { filter }: QueryGetArma3AttendanceArgs,
  context: Context
): Promise<Arma3Attendance> => {
  const data = await context.dataSources.mongoDB.getArma3Attendance({ filter });
  return data;
};
