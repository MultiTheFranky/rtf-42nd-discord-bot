import {
  getAppwriteCollectionData,
  updateAppwriteCollectionData,
  writeAppwriteCollectionData,
} from "appwrite";
import { Client } from "discord.js";
import { AppwriteGroup, AppwriteMember, Group, Member } from "types/appwrite";
import { inspect } from "util";
import logger from "utils/logger";

const GROUPS = new Map<string, string[]>([
  ["COMMAND", ["HQ"]],
  ["HQ", ["Alpha", "Bravo", "Support"]],
  ["Alpha", []],
  ["Bravo", []],
  ["Support", []],
]);

const ROLES = [
  "COMMAND",
  "OFICIAL",
  "NCO",
  "SQUAD LEADER",
  "TEAM LEADER",
  "MÉDICO DE COMBATE",
];

export const getOrbatGroups = async () =>
  (await getAppwriteCollectionData("orbat", "groups"))
    .documents as AppwriteGroup[];

export const getOrbatUnits = async () =>
  (await getAppwriteCollectionData("orbat", "units"))
    .documents as AppwriteMember[];

export const getOrbatDocuments = async () => {
  const groups = await getOrbatGroups();
  const units = await getOrbatUnits();
  return { groups, units };
};

export const updateOrbatGroup = async (group: Group) =>
  updateAppwriteCollectionData("orbat", "groups", group.name, group);

export const updateOrbatUnit = async (unit: Member) =>
  updateAppwriteCollectionData("orbat", "units", unit.name, unit);

export const writeUnit = async (unit: Member) => {
  if ((await getOrbatUnits()).find((u) => u.name === unit.name)) {
    logger.info("Updating unit");
    return updateOrbatUnit(unit);
  }
  logger.info("Writing unit");
  return writeAppwriteCollectionData("orbat", "units", unit.name, unit);
};

export const writeGroup = async (group: Group) => {
  if ((await getOrbatGroups()).find((g) => g.name === group.name)) {
    logger.info("Updating group");
    return updateOrbatGroup(group);
  }
  logger.info("Writing group");
  return writeAppwriteCollectionData("orbat", "groups", group.name, group);
};

export const createOrbat = async (client: Client) => {
  logger.info("Creating ORBAT");
  const staticGroups = Array.from(GROUPS.keys());
  const guild = client.guilds.cache.get("1180586120556331107");
  if (!guild) return;
  const roles = guild.roles.cache;
  for (const group of staticGroups) {
    // Members of the group/role of Discord
    const role = roles.find(
      (r) => r.name.toLowerCase() === group.toLowerCase(),
    );
    if (!role) {
      logger.error(`Role ${group} not found`);
      continue;
    }
    const roleMembers = Array.from(role.members.values());
    const membersInGroup = roleMembers.map((m) => ({
      $id: m.nickname || m.user.username,
      name: m.nickname || m.user.username,
      role:
        ROLES.find((staticRole) =>
          m.roles.cache.has(
            roles.find((r) => r.name.toLowerCase() === staticRole.toLowerCase())
              ?.id || "",
          ),
        ) || "RIFLEMAN",
    })) as AppwriteMember[];
    logger.info(
      `Members in ${group}: ${inspect(membersInGroup, true, null, true)}`,
    );
    try {
      await writeGroup({
        name: group,
        members: membersInGroup,
        subgroups: GROUPS.get(group) || [],
      });
    } catch (error) {
      logger.error(`Error writing group ${group}: ${error}`);
      return;
    }

    logger.info(`Group ${group} updated`);
  }
};
