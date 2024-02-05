import { Arma3AttendanceInput } from "graphql/__generated__/graphql";
import { ObjectId, Document } from "mongodb";

export interface Arma3Attendance extends Document, Arma3AttendanceInput {
  _id: ObjectId;
}
