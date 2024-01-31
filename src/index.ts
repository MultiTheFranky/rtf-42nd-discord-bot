import logger from "discord/logger";
import { initDiscordBot } from "discord";
import { startApolloServer } from "graphql/graphql";

// Handle unhandled promise rejections on apollo server
process.on("unhandledRejection", (error: Error) => {
  logger.error(`Unhandled Rejection at: ${error.stack ?? error.message}`);
});

// Handle uncaught exceptions on apollo server
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception thrown", err);
});

initDiscordBot()
  .then(() => {
    logger.info("Discord bot started");
  })
  .catch((error) => {
    logger.error("Discord bot failed to start", error);
  });

startApolloServer();
