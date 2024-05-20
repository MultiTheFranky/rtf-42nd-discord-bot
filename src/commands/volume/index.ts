import { ApplicationCommandOptionType } from "discord.js";
import { distube } from "server";
import { DiscordCommand } from "types/discord";

export const command: DiscordCommand = {
  name: "volume",
  description: "Sets the volume of the music",
  options: [
    {
      name: "volume",
      description: "The volume to set",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  execute: async (interaction) => {
    await interaction.deferReply();
    const volume = interaction.options.get("volume");
    if (!volume) {
      interaction.editReply("No volume found");
      return;
    }
    const queue = distube.getQueue(interaction);
    if (!queue) {
      await interaction.editReply("There is no queue");
    } else {
      const newVolume = queue.setVolume(volume.value as number);
      await interaction.editReply(`Volume is now ${newVolume}`);
    }
  },
  onReaction: async () => {},
};
