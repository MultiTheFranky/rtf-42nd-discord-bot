import { GuildMember } from "discord.js";
import { distube } from "server";
import { DiscordCommand } from "types/discord";

export const command: DiscordCommand = {
  name: "stop",
  description: "Stops the music",
  options: [],
  execute: async (interaction) => {
    await interaction.deferReply();
    const voiceChannel = (interaction.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await interaction.editReply(
        "You need to be in a voice channel to stop music!",
      );
      return;
    }
    distube.stop(voiceChannel);
    await interaction.editReply("Stopped the music");
  },
  onReaction: async () => {},
};
