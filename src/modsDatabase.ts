import { existsSync, mkdirSync } from "fs";
import JSONdb from "simple-json-db";

// eslint-disable-next-line import/no-mutable-exports
export let db: JSONdb;
export const initDB = async () => {
  // Create folder if not exists
  if (!existsSync("./db")) {
    mkdirSync("./db");
  }
  db = new JSONdb("./db/dbmods.json");
};

export const writeToDB = async (key: string, value: any) => {
  if (!db) {
    await initDB();
  }
  return db.set(key, value);
};

export const readFromDB = async (key: string) => {
  if (!db) {
    await initDB();
  }
  return db.get(key);
};

export const deleteFromDB = async (key: string) => {
  if (!db) {
    await initDB();
  }
  return db.delete(key);
};

export const getAllFromDB = async () => {
  if (!db) {
    await initDB();
  }
  return db.JSON();
};
