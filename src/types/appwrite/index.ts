import type { Models } from "node-appwrite";

export type AppwriteGroup = Group & Models.Document;

export type AppwriteMember = Member & Models.Document;

export type Member = {
  name: string;
  role: string;
};

export type Group = {
  name: string;
  members: AppwriteMember[];
  subgroups: string[];
};
