import { distube } from "server";
import { DiscordCommand } from "types/discord";

export const command: DiscordCommand = {
  name: "autoplay",
  description: "Toggles autoplay",
  options: [],
  execute: async (interaction) => {
    await interaction.deferReply();
    const queue = distube.getQueue(interaction);
    if (!queue) {
      await interaction.editReply("There is no queue");
    } else {
      const autoplay = queue.toggleAutoplay();
      await interaction.editReply(`Autoplay is now ${autoplay ? "on" : "off"}`);
    }
  },
  onReaction: async () => {},
};
