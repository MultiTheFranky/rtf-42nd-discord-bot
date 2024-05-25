import { ApplicationCommandOptionType } from "discord.js";
import { distube } from "server";
import { DiscordCommand } from "types/discord";

export const command: DiscordCommand = {
  name: "play",
  description: "Plays a song",
  options: [
    {
      name: "song",
      description: "The song to play. Can be a URL or a search query",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
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
