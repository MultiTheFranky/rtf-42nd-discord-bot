/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import { GraphQLError, GraphQLFormattedError } from "graphql";
import { LoggingConfig } from "graphql/config-loader";
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
} from "@apollo/server";
import { VariableValues } from "@apollo/server/dist/esm/externalTypes/graphql";
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
      stack: error.stack,
    },
    query,
  };

  if (enableVariables && enableStackTrace) {
    return logger.error(message, {
      ...errorContext,
      error: {
        stackTrace: error.stack,
      },
      variables,
    });
  }
  if (enableVariables) {
    return logger.error(message, {
      ...errorContext,
      variables,
    });
  }
  if (enableStackTrace) {
    return logger.error(message, {
      ...errorContext,
      error: {
        stackTrace: error.stack,
      },
    });
  }
  return logger.error(message, errorContext);
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
  async requestDidStart(requestContext: GraphQLRequestContext<BaseContext>) {
    // let { query, variables } = requestContext.request;
    let { query } = requestContext.request;
    const { variables } = requestContext.request;

    const stacktraceEnabled: boolean = !config.LOGGING_STACKTRACE_ENABLED;
    const variablesEnabled: boolean = !config.LOGGING_VARIABLES_ENABLED;
    const queryEnabled: boolean = !config.LOGGING_QUERY_ENABLED;
    query = !queryEnabled ? query : undefined;

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
    };
  },
});
