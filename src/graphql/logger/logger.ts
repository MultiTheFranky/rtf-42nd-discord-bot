/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
const winston = require("winston");

export const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

export interface Logger {
  debug(message: string, ..._data: any): void;

  info(message: string, ..._data: any): void;

  warn(message: string, ..._data: any): void;

  error(message: string, ..._data: any): void;
}
