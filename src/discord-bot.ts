import { Client, GatewayIntentBits, Partials } from "discord.js";
import logger from "utils/logger";
import { registerEventsOnReady } from "events/index";
import {
  listenerOnInteractionCreate,
  registerCommandsOnReady,
  reactionListener,
} from "commands/index";
import { cronJobReactionListener, initCronJobs } from "cronJobs";

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

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    logger.error("No token provided!");
    process.exit(1);
  }

  // Login to Discord
  await client.login();

  client.on("ready", () => {
    logger.info(`Logged in as ${client.user?.tag}!`);
    initCronJobs();
  });

  return client;
};
