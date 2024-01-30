import { DiscordCommand } from "discord/types/discord";
import { randomInt } from "crypto";

// Create a new command with the slash command builder
export const command: DiscordCommand = {
  name: "roll",
  nameLocalizations: {
    "en-US": "roll",
    de: "roll",
    "es-ES": "roll",
  },
  description: "Makes a roll",
  descriptionLocalizations: {
    "en-US": "Makes a roll",
    de: "Macht eine Rolle",
    "es-ES": "Hace una tirada",
  },
  options: [],
  execute: async (interaction) => {
    await interaction.reply({
      content: `Resultado: ${randomInt(1, 100)}`,
      ephemeral: false,
    });
  },
  onReaction: async () => {},
};
