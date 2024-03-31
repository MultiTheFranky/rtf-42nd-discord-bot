import axios from "axios";
import { Mod, ModJson } from "types/mods";
import jsdom from "jsdom";
import { getAllFromDB, readFromDB, writeToDB } from "modsDatabase";
import logger from "utils/logger";

export const getModChangeNotes = async (modId: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://steamcommunity.com/sharedfiles/filedetails/changelog/${modId}`,
    );
    if (!response.data) return "";
    const dom = new jsdom.JSDOM(response.data);
    const element = dom.window.document.querySelector(".detailBox");
    if (!element) return "";
    const changeNote = element.textContent
      ?.replace(/\t/g, "")
      .replace(/\s\s\s\s/g, "\n")
      .replace(/\n\n/g, "\n")
      .replace(/\n\n\n/g, "\n")
      .replace(/\n\n/g, "\n")
      .replace("Discuss this update in the discussions section.\n", "");
    if (!changeNote) return "";
    return changeNote;
  } catch (error) {
    logger.error(error);
    return "";
  }
};

export const getModFromJson = async (mod: ModJson): Promise<Mod> => ({
  id: mod.publishedfileid,
  name: mod.title,
  createdAt: new Date(mod.time_created * 1000).toISOString(),
  updatedAt: new Date(mod.time_updated * 1000).toISOString(),
  lastChangeLog: await getModChangeNotes(mod.publishedfileid),
});

export const getMod = async (modId: string): Promise<Mod> => {
  const params = new FormData();
  params.append(
    "Content-Type",
    "application/x-www-form-urlencoded;charset=UTF-8",
  );
  params.append("itemcount", "1");
  params.append("publishedfileids[0]", modId);
  const response = await axios.post(
    "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
    params,
  );
  const mod = response.data.response.publishedfiledetails[0] as ModJson;
  return getModFromJson(mod);
};

export const getMods = async (modIds: string[]): Promise<Mod[]> => {
  const params = new FormData();
  params.append(
    "Content-Type",
    "application/x-www-form-urlencoded;charset=UTF-8",
  );
  params.append("itemcount", `${modIds.length}`);
  modIds.forEach((modId, index) => {
    params.append(`publishedfileids[${index}]`, modId);
  });
  try {
    const response = await axios.post(
      "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
      params,
    );
    const mods = response.data.response.publishedfiledetails as ModJson[];
    return await Promise.all(mods.map(getModFromJson));
  } catch (error) {
    logger.error(error);
    return [];
  }
};

export const getImportMods = async (htmlImport: string): Promise<string[]> => {
  const dom = new jsdom.JSDOM(htmlImport);
  const modIds: string[] = [];
  dom.window.document
    .querySelectorAll('tr[data-type="ModContainer"]')
    .forEach((mod) => {
      const modId = mod
        .querySelector('a[data-type="Link"]')
        ?.getAttribute("href")
        ?.split("id=")[1];
      if (modId) modIds.push(modId);
    });
  return modIds;
};

export const isModUpdated = async (mod: Mod): Promise<boolean> => {
  const params = new FormData();
  params.append(
    "Content-Type",
    "application/x-www-form-urlencoded;charset=UTF-8",
  );
  params.append("itemcount", "1");
  params.append("publishedfileids[0]", mod.id);
  const response = await axios.post(
    "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
    params,
  );
  const modJson = response.data.response.publishedfiledetails[0] as ModJson;
  return mod.updatedAt !== new Date(modJson.time_updated * 1000).toISOString();
};

export const getUpdatedMods = async (mods: Mod[]): Promise<Mod[]> => {
  const params = new FormData();
  params.append(
    "Content-Type",
    "application/x-www-form-urlencoded;charset=UTF-8",
  );
  params.append("itemcount", "1");
  mods.forEach((mod, index) => {
    params.append(`publishedfileids[${index}]`, mod.id);
  });
  const response = await axios.post(
    "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
    params,
  );
  const modsJson = response.data.response.publishedfiledetails as ModJson[];
  const modsUpdated = await Promise.all(
    modsJson.map((modsJsonValue) => {
      const mod = mods.find(
        (modU) => modU.id === modsJsonValue.publishedfileid,
      );
      if (
        mod &&
        mod.updatedAt !==
          new Date(modsJsonValue.time_updated * 1000).toISOString()
      )
        return getModFromJson(modsJsonValue);
      return null;
    }),
  );
  return modsUpdated.filter((mod) => mod !== null) as Mod[];
};

export const writeModToDB = async (mod: Mod): Promise<void> => {
  writeToDB(mod.id, mod);
};

export const readModFromDB = async (modId: string): Promise<Mod> =>
  readFromDB(modId);

export const getAllModsFromDB = async (): Promise<Mod[]> => {
  const records = await getAllFromDB();
  return Object.values(records);
};
