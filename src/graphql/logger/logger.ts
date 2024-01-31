/* eslint-disable @typescript-eslint/no-var-requires */

import { LOG_DIR } from "discord/logger";
import path from "path";
import { format, transports, createLogger } from "winston";

export const PROJECT = "rtf-42nd-graph-ql";

const prettifyStackError = (error: Error): string => {
  const stack = error.stack?.split("\n");
  if (!stack) {
    return "";
  }
  const stackTrace = stack
    .map((line) => {
      if (line.includes("node_modules")) {
        return "";
      }
      const regex = /at Object.(\w+) \((.+):(\d+):(\d+)\)/g;
      const matches = regex.exec(line);
      if (matches) {
        const [, method, file, lineLog, column] = matches;
        // Remove /Users/francisco/Documents/Mis cosas/rtf-42nd-discord-bot/ from file
        const filePretty = file.replace(
          `${path.dirname(__dirname)}/`,
          "graphql/"
        );
        return `On: \n\t\t\tObject.${method} => ${filePretty}:${lineLog}:${column}`;
      }
      return "";
    })
    .filter((line) => line !== "")
    .join("\n");
  return stackTrace;
};

export const logger = createLogger({
  transports: [
    new transports.DailyRotateFile({
      // without colors
      format: format.combine(
        format.label({ label: path.basename(PROJECT) }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}${
              info.error && info.message ? `\n\t\t\t${info.error.message}` : ""
            }${
              info.error && info.error.stack
                ? `\n\t\t\t${prettifyStackError(info.error)}`
                : ""
            }`
        )
      ),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: 30,
      level: "debug",
      filename: `${LOG_DIR}/${PROJECT}-%DATE%.log`,
    }),
    new transports.Console({
      // colorized
      format: format.combine(
        format.colorize(),
        format.label({ label: path.basename(PROJECT) }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}${
              info.error && info.message ? `\n\t\t\t${info.error.message}` : ""
            }${
              info.error && info.error.stack
                ? `\n\t\t\t${prettifyStackError(info.error)}`
                : ""
            }`
        )
      ),
      level: "info",
    }),
  ],
});

export interface Logger {
  debug(message: string, ..._data: any): void;

  info(message: string, ..._data: any): void;

  warn(message: string, ..._data: any): void;

  error(message: string, ..._data: any): void;
}
