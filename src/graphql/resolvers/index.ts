import { DateResolver } from "graphql-scalars";
import { getArma3Attendance } from "./arma3";

export const resolvers = {
  Date: DateResolver,
  Query: {
    getArma3Attendance,
  },
};
