import express from "express";
import { Client } from "discord.js";
import logger from "utils/logger";
import { startDiscordBot } from "src/discord-bot";
import { initDB } from "src/database";
// import { startPterodactyl } from "./pterodactyl";

// eslint-disable-next-line import/no-mutable-exports
export let client: Client;

// Unhandled rejections
process.on("unhandledRejection", (error) => {
  if (error instanceof Error) {
    logger.error(`Unhandled rejection: ${error.message}`);
  }
});

(async () => {
  const app = express();

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // Init database
  await initDB();

  // Discord bot
  client = await startDiscordBot();

  app.listen(process.env.PORT, () => {
    logger.info(`Listening on port ${process.env.PORT}`);
  });
})();
