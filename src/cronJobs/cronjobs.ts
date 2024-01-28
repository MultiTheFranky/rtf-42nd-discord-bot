import { client } from "server";
import { mission, onReaction } from "./mission";
import { CronJob } from "./types";

export const CronJobs: CronJob[] = [
  {
    name: "missionCronJob",
    execute: async () => {
      const guild = client.guilds.cache.get("1180586120556331107");
      if (!guild) return;
      await mission(guild);
    },
    onReaction: async (reaction, user) => {
      onReaction(reaction, user);
    },
    cron: "0 0 12 * * 1",
  },
];
