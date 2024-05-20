import { ApplicationCommandOptionType } from "discord.js";
import { DiscordCommand } from "types/discord";
import {
  getImportMods,
  getMods,
  removeAllModsFromDB,
  writeModToDB,
} from "utils/steam";

export const command: DiscordCommand = {
  name: "mods",
  nameLocalizations: {
    "en-US": "mods",
    de: "mods",
    "es-ES": "mods",
  },
  description: "Imports html mods import from Arma 3 launcher",
  options: [
    {
      name: "file",
      description: "File to import",
      type: ApplicationCommandOptionType.Attachment,
      required: true,
    },
  ],
  execute: async (interaction) => {
    await interaction.deferReply();
    const file = interaction.options.get("file");
    if (!file) return;
    const htmlImportURL = (await file.attachment?.url) as string;
    const data = await fetch(htmlImportURL);
    if (!data.ok) {
      await interaction.editReply("Error fetching file");
      return;
    }
    try {
      const modIds = await getImportMods(await data.text());
      const mods = await getMods(modIds);
      await removeAllModsFromDB();
      await Promise.all(mods.map(writeModToDB));
      const message = `Imported ${mods.length} mods`;
      await interaction.editReply(message);
    } catch (error) {
      await interaction.editReply(`Error importing mods ${error}`);
    }
  },
  onReaction: async () => {},
};
