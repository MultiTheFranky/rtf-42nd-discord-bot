import express from "express";
import { Client } from "discord.js";
import { startDiscordBot } from "discord-bot";
import { initDB } from "database";
import logger from "utils/logger";

// eslint-disable-next-line import/no-mutable-exports
export let client: Client;

// Unhandled rejections
/* process.on("unhandledRejection", (error) => {
  if (error instanceof Error) {
    logger.error(`Unhandled rejection: ${error.message}`);
  }
}); */

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
