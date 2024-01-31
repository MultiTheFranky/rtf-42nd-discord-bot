import { Client, GatewayIntentBits, Partials } from "discord.js";
import logger from "discord/logger";
import { registerEventsOnReady } from "discord/events/index";
import {
  listenerOnInteractionCreate,
  registerCommandsOnReady,
  reactionListener,
} from "discord/commands/index";
import { initAnswerCallback, initReactionCallback } from "discord/form";
import { cronJobReactionListener, initCronJobs } from "discord/cronJobs";
import { initDB } from "discord/database";

// eslint-disable-next-line import/no-mutable-exports
export let bot: Client;

export const startDiscordBot = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildScheduledEvents,
      GatewayIntentBits.AutoModerationConfiguration,
      GatewayIntentBits.AutoModerationExecution,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.Channel],
  });

  // Register all commands
  await registerCommandsOnReady(client);

  // Listen for interactions
  await listenerOnInteractionCreate(client);

  // Listen for reactions
  await reactionListener(client);
  await cronJobReactionListener(client);

  // Register all events
  await registerEventsOnReady(client);

  initAnswerCallback(client);

  initReactionCallback(client);

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    logger.error("No token provided!");
    throw new Error("No token provided!");
  }

  // Login to Discord
  await client.login();

  client.on("ready", () => {
    logger.info(`Logged in as ${client.user?.tag}!`);
    initCronJobs();
  });

  return client;
};

export const initDiscordBot = async (): Promise<void> => {
  // Init database
  await initDB();

  // Discord bot
  bot = await startDiscordBot();
};
