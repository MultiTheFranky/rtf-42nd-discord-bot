import { MessageReaction, User } from "discord.js";

export type CronJob = {
  name: string;
  execute: () => Promise<void>;
  cron: string;
  onReaction?: (reaction: MessageReaction, user: User) => Promise<void>;
};
