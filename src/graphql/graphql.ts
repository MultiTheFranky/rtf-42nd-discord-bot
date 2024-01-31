import type { GraphQLResolveInfo } from "graphql";
import { getFilePath, importSchema } from "graphql/utils/graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { expressMiddleware } from "@apollo/server/express4";
import {
  RateLimitArgs,
  defaultKeyGenerator,
  rateLimitDirective,
} from "graphql-rate-limit-directive";
import { createMongoDBClient } from "graphql/clients";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServer } from "@apollo/server";
import express from "express";
import cors from "cors";
import http from "http";
import { logger, loggingPlugin } from "./logger";
import { getConfig } from "./config-loader";
import { resolvers } from "./resolvers";
import { dataSources } from "./datasources";

export const startApolloServer = async () => {
  const config = getConfig();

  const mongoDBClient = createMongoDBClient(config);

  const keyGenerator = (
    directiveArgs: RateLimitArgs,
    source: unknown,
    args: { [key: string]: unknown },
    context: any,
    info: GraphQLResolveInfo
  ) =>
    `${context.ipRateLimiter}:${defaultKeyGenerator(
      directiveArgs,
      source,
      args,
      context,
      info
    )}`;

  const onLimit = (resource: any) => {
    throw new Error(
      `You have exceeded your request limit of ${resource.max} requests per ${resource.window} seconds.`
    );
  };

  const { rateLimitDirectiveTypeDefs, rateLimitDirectiveTransformer } =
    rateLimitDirective({
      keyGenerator,
      onLimit,
      limiterOptions: { blockDuration: 900 },
    });
  let schema = makeExecutableSchema({
    typeDefs: [
      rateLimitDirectiveTypeDefs,
      importSchema(getFilePath("main.graphql")),
      importSchema(getFilePath("arma3.graphql")),
    ],
    resolvers,
  });

  schema = rateLimitDirectiveTransformer(schema);

  const PORT = config.PORT || 4000;

  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema,
    plugins: [
      loggingPlugin(logger, config),
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  await server.start();
  try {
    app.use(
      "/graphql",
      cors<cors.CorsRequest>(),
      express.json({
        limit: "50mb",
      }),
      expressMiddleware(server, {
        context: async () => ({
          dataSources: dataSources(mongoDBClient),
        }),
      })
    );

    await new Promise<void>((resolve) =>
      // eslint-disable-next-line no-promise-executor-return
      httpServer.listen({ port: PORT }, resolve)
    );
    logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  } catch (error) {
    logger.error("Failed to start apollo server", error);
  }
};
