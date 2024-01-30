import { logger } from "graphql/logger";
import * as crypto from "crypto";
import { ErrorMessage, FieldErrorItem } from "graphql/types/content/common";
import { getConfig } from "../../config-loader";

export const logAndReturnError = (
  inputMessage: string,
  error?: any,
  customDimension?: object
): Error => {
  const newError = new Error(inputMessage);
  logger.error(inputMessage, { error }, customDimension);
  return newError;
};

export const logAndReturnSerializedError = (
  inputMessage: string,
  error?: Array<any>,
  customDimension?: object
): Error => {
  const errorMessage: ErrorMessage = {
    serverError: inputMessage,
    fieldErrors: [],
  };

  if (Array.isArray(error)) {
    error.forEach((errorItem) => {
      const fieldError: FieldErrorItem = {
        message: errorItem.message ?? "",
        code: errorItem.code ?? "",
        field: errorItem.field ?? "",
      };

      errorMessage.fieldErrors?.push(fieldError);
    });
  }

  const newError = new Error(JSON.stringify(errorMessage));
  logger.error(inputMessage, { error }, customDimension);
  return newError;
};

export const logDebugSafeData = (message: string, data: any) => {
  const config = getConfig();
  const iv = crypto.randomBytes(16);
  const key = crypto
    .createHash("sha256")
    .update(
      String(
        config.LOGGING_ENCRYPT_PASS ??
          "9DvdiWBekvFzpB6ViSr5iR92sMM885nhUdkAUAm5BwF2NzKyMUCR5S6mF4UyFooS7sP2saY9UMLhDs2BBaW3F6uizZuYEhMz45EHPVtZR6gfLWyUQcP67wmNAYqpgAKE"
      )
    )
    .digest("base64")
    .substring(0, 32);
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);

  const encdata = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(data)).toString("base64")),
    cipher.final(),
  ]);

  logger.debug(message, { encdata, iv });
};
