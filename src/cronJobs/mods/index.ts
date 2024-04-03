import { Guild, TextChannel } from "discord.js";
import logger from "utils/logger";
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
            <@&${taskforceRole.id}>\nEl mod **${modUpdatedInfo.name}** ha sido actualizado:\n- Fecha de actualización: **${new Date(
              modUpdatedInfo.updatedAt,
            ).toLocaleString("es-ES", {
              timeZone: "Europe/Madrid",
            })}**\n${truncateString(modUpdatedInfo.lastChangeLog, 3000)}\n**Por favor, actualiza el mod dando a reparar en el launcher de Arma 3.**`);
      await writeModToDB(modUpdatedInfo);
    });
  } catch (error) {
    logger.error(error);
  }
};
