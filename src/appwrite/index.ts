import { Client, Databases, Permission, Role } from "node-appwrite";

let client: Client;

const initAppwrite = () => {
  if (client) {
    return client;
  }
  const endpoint = process.env.APPWRITE_ENDPOINT;
  const project = process.env.APPWRITE_PROJECT;
  const key = process.env.APPWRITE_API_KEY;
  if (!endpoint || !project || !key) {
    throw new Error("Appwrite environment variables not found");
  }
  client = new Client();
  client
    .setEndpoint(endpoint) // Your API Endpoint
    .setProject(project) // Your project ID
    .setKey(key); // Your secret API key
  return client;
};

export const getAppwriteClient = () => {
  if (!client) {
    return initAppwrite();
  }
  return client;
};

export const getAppwriteCollectionData = async (
  databaseId: string,
  collectionId: string,
) => new Databases(getAppwriteClient()).listDocuments(databaseId, collectionId);

export const writeAppwriteCollectionData = async (
  databaseId: string,
  collectionId: string,
  id: string,
  data: any,
) =>
  new Databases(getAppwriteClient()).createDocument(
    databaseId,
    collectionId,
    id,
    data,
    [Permission.read(Role.any())],
  );

export const updateAppwriteCollectionData = async (
  databaseId: string,
  collectionId: string,
  id: string,
  data: any,
) =>
  new Databases(getAppwriteClient()).updateDocument(
    databaseId,
    collectionId,
    id,
    data,
    [Permission.read(Role.any())],
  );
