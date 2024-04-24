import { Guild, TextChannel } from "discord.js";
import { getPlayersOnline, isServerOnline } from "utils/gamedig";
import logger from "utils/logger";
import { getServers, restartServer } from "utils/pterodactyl";
import {
  getAllModsFromDB,
  getMod,
  getUpdatedMods,
  writeModToDB,
} from "utils/steam";

export const truncateString = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return `${str.substring(0, maxLength)}...`;
  }
  return str;
};

export const mods = async (guild: Guild) => {
  // Get the "mods-update" channel
  try {
    const channel = guild.channels.cache.find(
      (c) => c.name === "mods-update",
    ) as TextChannel;
    const modsDB = await getAllModsFromDB();
    if (modsDB.length === 0) return;
    const modsUpdated = await getUpdatedMods(modsDB);
    modsUpdated.forEach(async (mod) => {
      const modUpdatedInfo = await getMod(mod.id);
      const taskforceRole = guild.roles.cache.get("1180598124268507196");
      if (!taskforceRole) return;
      channel.send(`
            <@&${taskforceRole.id}>\nEl mod **[${modUpdatedInfo.name}](https://steamcommunity.com/sharedfiles/filedetails/?id=${modUpdatedInfo.id})** ha sido actualizado:\n- Fecha de actualización: **${new Date(
              modUpdatedInfo.updatedAt,
            ).toLocaleString("es-ES", {
              timeZone: "Europe/Madrid",
            })}**\n${truncateString(modUpdatedInfo.lastChangeLog, 1000)}\n**Por favor, actualiza el mod dando a reparar en el launcher de Arma 3.**`);
      await writeModToDB(modUpdatedInfo);
    });
    if (modsUpdated.length === 0) return;
    logger.info("Mods updated. Trying to restart server.");
    // Trying to update the server
    const server = (await getServers()).find(
      (serverData) => serverData.name === process.env.SERVER_NAME,
    );
    if (!server) return;
    // If server has users not restart it
    // If it's between 19:00 and 22:00 of sunday don't restart it
    // If server is offline don't restart it
    const playersOnline = await getPlayersOnline(
      process.env.SERVER_HOSTNAME || "",
    );
    const date = new Date();
    if (
      playersOnline > 3 || // 3 Headless clients
      (date.getDay() === 0 && date.getHours() >= 19 && date.getHours() < 22) ||
      (await isServerOnline(process.env.SERVER_HOSTNAME || ""))
    ) {
      return;
    }
    logger.info("Restarting server.");
    // Restart the server
    await restartServer(server.identifier);
  } catch (error) {
    logger.error(error);
  }
};
