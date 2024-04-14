import { Events, GuildMember, TextChannel } from "discord.js";
import { DiscordEvent } from "types/discord";

const CHANNEL = "llegadas";
const INITIAL_ROLE = "ASPIRANTE";

export const event: DiscordEvent = {
  event: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === CHANNEL && ch.isTextBased(),
    ) as TextChannel;
    if (!channel) return;
    channel.send(
      `Bienvenido al servidor, ${member}. Por favor, lee las reglas y rellena este formulario: https://form.multithefranky.com/form/VjMXvL\n
      Welcome to the server, ${member}. Please read the rules and fill this form: https://form.multithefranky.com/form/VjMXvL`,
    );
    const role = member.guild.roles.cache.find(
      (roleTemp) => roleTemp.name === INITIAL_ROLE,
    );
    if (!role) return;
    member.roles.add(role);
  },
};
