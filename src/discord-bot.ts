import { Client, GatewayIntentBits, Partials } from "discord.js";
import logger from "utils/logger";
import { registerEventsOnReady } from "events/index";
import {
  listenerOnInteractionCreate,
  registerCommandsOnReady,
  reactionListener,
} from "commands/index";
import { cronJobReactionListener, initCronJobs } from "cronJobs";
import DisTube, { Queue, Events } from "distube";
import SpotifyPlugin from "@distube/spotify";
import SoundCloudPlugin from "@distube/soundcloud";
import { YtDlpPlugin } from "@distube/yt-dlp";

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

export const startDistubeBot = async (client: Client) => {
  const distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [new SpotifyPlugin(), new SoundCloudPlugin(), new YtDlpPlugin()],
  });

  const status = (queue: Queue) =>
    `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(", ") || "Off"}\` | Loop: \`${
      // eslint-disable-next-line no-nested-ternary
      queue.repeatMode
        ? queue.repeatMode === 2
          ? "All Queue"
          : "This Song"
        : "Off"
    }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
  distube
    .on(
      Events.PLAY_SONG,
      (queue, song) =>
        queue.textChannel &&
        queue.textChannel.send(
          `▶️ | Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${
            song.user
          }\n${status(queue)}`,
        ),
    )
    .on(
      Events.ADD_SONG,
      (queue, song) =>
        queue.textChannel &&
        queue.textChannel.send(
          `☑️ | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
        ),
    )
    .on(
      Events.ADD_LIST,
      (queue, playlist) =>
        queue.textChannel &&
        queue.textChannel.send(
          `☑️ | Added \`${playlist.name}\` playlist (${
            playlist.songs.length
          } songs) to queue\n${status(queue)}`,
        ),
    )
    .on(Events.ERROR, (e, queue) => {
      if (queue && queue.textChannel)
        queue.textChannel.send(
          `❌ | An error encountered: ${e.toString().slice(0, 1974)}`,
        );
      else logger.error(e);
    })
    .on(Events.DELETE_QUEUE, (queue) => {
      if (queue.textChannel) queue.textChannel.send("❌ | Queue deleted");
    })
    .on(
      Events.FINISH,
      (queue) => queue.textChannel && queue.textChannel.send("Finished!"),
    );

  return distube;
};
