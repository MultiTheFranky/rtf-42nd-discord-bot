import { bot } from "discord";
import { mission, onReaction } from "./mission";
import { CronJob } from "./types";

export const CronJobs: CronJob[] = [
  {
    name: "missionCronJob",
    execute: async () => {
      const guildID = process.env.DISCORD_GUILD_ID;
      if (!guildID) return;
      const guild = bot.guilds.cache.get(guildID);
      if (!guild) return;
      await mission(guild);
    },
    onReaction: async (reaction, user) => {
      onReaction(reaction, user);
    },
    cron: "0 0 12 * * 1",
  },
];
