import {
  ApplicationCommandOptionType,
  GuildMember,
  TextChannel,
} from "discord.js";
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
    const song = interaction.options.get("song");
    if (!song) {
      interaction.editReply("No song found");
      return;
    }
    const voiceChannel = (interaction.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      await interaction.editReply(
        "You need to be in a voice channel to play music!",
      );
      return;
    }
    await distube.play(voiceChannel, song.value as string, {
      member: interaction.member as GuildMember,
      textChannel: (interaction.channel as TextChannel) ?? undefined,
    });
    interaction.editReply(`Playing ${song.value}`);
  },
  onReaction: async () => {},
};
