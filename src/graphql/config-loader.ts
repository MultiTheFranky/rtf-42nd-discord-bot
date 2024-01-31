import { JSONSchemaType } from "ajv";
import { logger } from "./logger";
import { validate } from "./validation";

export type PortConfig = {
  PORT?: string;
};

export type MongoDBConfig = {
  MONGODB_URI: string;
  MONGODB_DB: string;
};

export type LoggingConfig = {
  LOGGING_LEVEL?: "debug" | "info" | "error" | "warn";
  LOGGING_STACKTRACE_ENABLED?: "true" | "false";
  LOGGING_VARIABLES_ENABLED?: "true" | "false";
  LOGGING_QUERY_ENABLED?: "true" | "false";
  LOGGING_ENCRYPT_PASS?: string;
};

export type CacheConfig = {
  NODE_CACHE_TTL_SECONDS?: string;
};

const schema: JSONSchemaType<MongoDBConfig & LoggingConfig & CacheConfig> = {
  type: "object",
  properties: {
    MONGODB_URI: { type: "string" },
    MONGODB_DB: { type: "string" },
    // this is work-around, dotenv returns only strings
    // however we can validate it using enumerations
    LOGGING_LEVEL: {
      type: "string",
      enum: ["debug", "info", "error", "warn"],
      nullable: true,
    },
    LOGGING_STACKTRACE_ENABLED: {
      type: "string",
      enum: ["true", "false"],
      nullable: true,
    },
    LOGGING_VARIABLES_ENABLED: {
      type: "string",
      enum: ["true", "false"],
      nullable: true,
    },
    LOGGING_QUERY_ENABLED: {
      type: "string",
      enum: ["true", "false"],
      nullable: true,
    },
    LOGGING_ENCRYPT_PASS: { type: "string", nullable: true },
    NODE_CACHE_TTL_SECONDS: { type: "string", nullable: true },
    PORT: { type: "string", nullable: true },
  },
  required: ["MONGODB_URI", "MONGODB_DB"],
  additionalProperties: true,
};

const loadConfig = (): unknown => {
  const { env } = process;

  return {
    MONGODB_URI: env.MONGODB_URI,
    MONGODB_DB: env.MONGODB_DB,
    LOGGING_LEVEL: env.LOGGING_LEVEL,
    LOGGING_STACKTRACE_ENABLED: env.LOGGING_STACKTRACE_ENABLED,
    LOGGING_VARIABLES_ENABLED: env.LOGGING_VARIABLES_ENABLED,
    LOGGING_ENCRYPT_PASS: env.LOGGING_ENCRYPT_PASS,
    NODE_CACHE_TTL_SECONDS: env.NODE_CACHE_TTL_SECONDS,
    PORT: env.PORT,
  };
};

const validateConfig = (
  result: unknown
): MongoDBConfig & LoggingConfig & CacheConfig => {
  try {
    return <MongoDBConfig & LoggingConfig & CacheConfig>(
      validate(result, schema)
    );
  } catch (errors) {
    const message = `Could not validate config`;
    logger.error(message, errors);
    throw new Error(message);
  }
};

export const getConfig = (): MongoDBConfig &
  LoggingConfig &
  CacheConfig &
  PortConfig => {
  const config = loadConfig();
  return validateConfig(config);
};
