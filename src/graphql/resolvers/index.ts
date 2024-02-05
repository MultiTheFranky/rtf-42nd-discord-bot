import { DateResolver } from "graphql-scalars";
import { addArma3Attendance, getArma3Attendance } from "./arma3";

export const resolvers = {
  Date: DateResolver,
  Query: {
    getArma3Attendance,
  },
  Mutation: {
    addArma3Attendance,
  },
};
