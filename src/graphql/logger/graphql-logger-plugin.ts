/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import { VariableValues } from "apollo-server-types";
import {
  ApolloServerPlugin,
  GraphQLRequestContext,
} from "apollo-server-plugin-base";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { LoggingConfig } from "graphql/config-loader";
import { Logger } from "./logger";

export const logError = (
  logger: Logger,
  error: Error,
  query: string | undefined,
  variables: VariableValues | undefined,
  enableVariables: boolean = false
): void => {
  if (enableVariables) {
    return logger.warn(`${error}`, { query, variables });
  }
  return logger.warn(`${error}`, { query });
};

export const logErrorWithStackTrace = (
  logger: Logger,
  error: Error,
  query: string | undefined,
  variables: VariableValues | undefined,
  enableVariables: boolean,
  enableStackTrace: boolean
): void => {
  const message = `The graphql request resulted in an error`;
  const errorContext = {
    error: {
      name: error.name,
      message: error.message,
    },
    query,
  };

  if (enableVariables && enableStackTrace) {
    return logger.warn(message, {
      ...errorContext,
      error: {
        stackTrace: error.stack,
      },
      variables,
    });
  }
  if (enableVariables) {
    return logger.warn(message, {
      ...errorContext,
      variables,
    });
  }
  if (enableStackTrace) {
    return logger.warn(message, {
      ...errorContext,
      error: {
        stackTrace: error.stack,
      },
    });
  }
  return logger.warn(message, errorContext);
};

export const logResponseWithError = (
  logger: Logger,
  errors: readonly GraphQLFormattedError[] | undefined,
  query: string | undefined,
  variables: VariableValues | undefined,
  enableVariables: boolean
): void => {
  if (enableVariables) {
    return logger.warn(`Response sent with ${errors ? "" : "NO "}errors!`, {
      errors,
      query,
      variables,
    });
  }
  return logger.warn(`Response sent with ${errors ? "" : "NO "}errors!`, {
    errors,
    query,
  });
};

export const loggingPlugin = (
  logger: Logger,
  config: LoggingConfig
): ApolloServerPlugin => ({
  async requestDidStart(requestContext: GraphQLRequestContext) {
    // let { query, variables } = requestContext.request;
    let { query } = requestContext.request;
    const { variables } = requestContext.request;

    const stacktraceEnabled: boolean = !config.LOGGING_STACKTRACE_ENABLED;
    const variablesEnabled: boolean = !config.LOGGING_VARIABLES_ENABLED;
    const queryEnabled: boolean = !config.LOGGING_QUERY_ENABLED;
    query = !queryEnabled ? query : undefined;

    if (!variablesEnabled) {
      logger.debug(`GraphQL request started!`, { query });
    } else {
      logger.debug(`GraphQL request started!`, { query, variables });
    }

    return {
      async parsingDidStart() {
        return async (error: Error) => {
          if (error) {
            logError(logger, error, query, variables);
          }
        };
      },

      async validationDidStart() {
        return async (errors: Error[]) => {
          if (errors) {
            errors.forEach((error) => {
              logError(logger, error, query, variables, variablesEnabled);
            });
          }
        };
      },
      async didEncounterErrors({
        errors,
      }: {
        errors: Readonly<GraphQLError[]>;
      }) {
        errors.forEach((error) => {
          const err = error.originalError || error;
          logErrorWithStackTrace(
            logger,
            err,
            query,
            variables,
            variablesEnabled,
            stacktraceEnabled
          );
        });
      },
      async executionDidStart() {
        return {
          async executionDidEnd(error: Error) {
            if (error) {
              logError(logger, error, query, variables, variablesEnabled);
            }
          },
        };
      },
      async willSendResponse(reqContext: GraphQLRequestContext) {
        const errors = reqContext.response?.errors;
        if (errors) {
          logResponseWithError(
            logger,
            errors,
            query,
            variables,
            variablesEnabled
          );
        }
      },
    };
  },
});
