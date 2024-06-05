import {
  Client,
  Events,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { CronJob as Cron } from "cron";
import { readFromDB } from "database";
import logger from "utils/logger";
import { MissionDBData } from "types/cronjobs";
import { CronJobs } from "./cronjobs";
import type { CronJob as CronJobType } from "./types";

export const initCronJobs = async () => {
  CronJobs.forEach((cronJob: CronJobType) => {
    Cron.from({
      cronTime: cronJob.cron,
      onTick: cronJob.execute,
      start: true,
      timeZone: "Europe/Madrid",
    });
  });
};

const onReaction = async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
) => {
  const cronJobs = CronJobs.filter((cronJob) => cronJob.onReaction);
  const getMessageCronjob = (await readFromDB(
    reaction.message.id,
  )) as MissionDBData;
  if (!getMessageCronjob) {
    return;
  }
  if (getMessageCronjob.completed) {
    return;
  }
  const cronJob = cronJobs.find(
    (cronJobFind) => cronJobFind.name === getMessageCronjob.name,
  );
  if (!cronJob || !cronJob.onReaction) {
    return;
  }

  // Execute the command
  try {
    cronJob.onReaction(reaction as MessageReaction, user as User);
  } catch (error) {
    logger.error(error);
    await reaction.message.reply({
      content: "There was an error while executing this command!",
    });
  }
};

export const cronJobReactionListener = async (client: Client) => {
  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    await onReaction(reaction, user);
  });

  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    await onReaction(reaction, user);
  });
};
