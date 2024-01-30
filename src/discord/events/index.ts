import { readdirSync } from "fs";
import { join } from "path";
import logger from "discord/logger";
import { DiscordEvent } from "discord/types/discord";
import { Client, Events } from "discord.js";
/**
 * Function to get all events in the events directory
 * @returns {DiscordEvent[]} - The events
 */
export const getEvents = async (): Promise<DiscordEvent[]> => {
  // Get all files in the commands directory
  const subDirectories = await readdirSync(__dirname, {
    withFileTypes: true,
  }).filter((dirent) => dirent.isDirectory());
  const files = await subDirectories.map((subDirectory) => {
    const subDirectoryFile = readdirSync(
      join(__dirname, subDirectory.name)
    ).filter(
      (file) =>
        file.includes(".js") ||
        (file.includes(".ts") && !file.includes(".d.ts"))
    )[0];

    return join(subDirectory.name, subDirectoryFile);
  });

  // Get all events
  const events: Promise<DiscordEvent>[] = await files.map(async (file) => {
    // Get the event
    const { event } = await import(join(__dirname, file));

    // Return the event
    return event as DiscordEvent;
  });

  // Resolve all events
  const resolvedEvents = await Promise.all(events);

  return resolvedEvents;
};

/**
 * Function to register all events
 * @param {Discord.Client} client - The client to register the events to
 */
export const registerEvents = async (client: Client) => {
  // Get all commands in the commands directory
  const events = await getEvents();
  // Register all commands
  const { user } = client;
  if (!user) {
    throw new Error("No user found!");
  }
  events.forEach((event) => {
    // Register the command
    client.on(event.event as any, event.execute);
    logger.info(`Registered event ${event.event}`);
  });
};

export const registerEventsOnReady = async (client: Client) => {
  client.on(Events.ClientReady, async () => {
    logger.info("Ready for events!");
    // Register all Events
    await registerEvents(client);
  });
};
