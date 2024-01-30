import { DateResolver, LocalTimeResolver } from "graphql-scalars";
import { getArma3Attendance } from "./arma3";

export const resolvers = {
  Date: DateResolver,
  LocalTime: LocalTimeResolver,
  Query: {
    getArma3Attendance,
  },
};
