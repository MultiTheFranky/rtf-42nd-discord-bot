import { distube } from "server";
import { DiscordCommand } from "types/discord";

export const command: DiscordCommand = {
  name: "skip",
  description: "Skips a song",
  options: [],
  execute: async (interaction) => {
    await interaction.deferReply();
    const queue = distube.getQueue(interaction);
    if (!queue) {
      interaction.editReply(`❌ | There is nothing in the queue right now!`);
      return;
    }
    try {
      const song = await queue.skip();
      interaction.editReply(`✅ | Skipped! Now playing:\n${song.name}`);
    } catch (e) {
      interaction.editReply(`❌ | ${e}`);
    }
  },
  onReaction: async () => {},
};
