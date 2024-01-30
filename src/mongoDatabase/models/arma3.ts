import { ObjectId } from "mongodb";

export interface Arma3Attendance {
  _id: ObjectId;
  date: string;
  attendance: number;
}
