import type { GraphQLResolveInfo } from "graphql";
import { getFilePath, importSchema } from "graphql/utils/graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  RateLimitArgs,
  defaultKeyGenerator,
  rateLimitDirective,
} from "graphql-rate-limit-directive";
import { ApolloServer } from "apollo-server";
import { createMongoDBClient } from "graphql/clients";
import { dataSources } from "graphql/datasources";
import { logger, loggingPlugin } from "./logger";
import { getConfig } from "./config-loader";
import { resolvers } from "./resolvers";

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
    importSchema(getFilePath("arma3.graphql")),
  ],
  resolvers,
});

schema = rateLimitDirectiveTransformer(schema);

export const server = new ApolloServer({
  schema,
  dataSources: () => dataSources(mongoDBClient),
  plugins: [loggingPlugin(logger, config)],
});
