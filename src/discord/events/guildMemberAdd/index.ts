import { Events, GuildMember, TextChannel } from "discord.js";
import { DiscordEvent } from "discord/types/discord";
import { sendForm } from "discord/form";
import { bot } from "discord";
import { initWelcomeForm } from "discord/form/welcomeForm";

const CHANNEL = "llegadas";
const INITIAL_ROLE = "ASPIRANTE";

export const event: DiscordEvent = {
  event: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === CHANNEL && ch.isTextBased()
    ) as TextChannel;
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}`);
    const role = member.guild.roles.cache.find(
      (roleTemp) => roleTemp.name === INITIAL_ROLE
    );
    if (!role) return;
    member.roles.add(role);
    const form = initWelcomeForm(member.user);
    await sendForm(form, bot);
  },
};
