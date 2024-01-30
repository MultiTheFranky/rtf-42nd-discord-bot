import Ajv from "ajv";

export const validate = <T>(
  data: unknown,
  JSONSchema: Record<string, unknown>
): T => {
  const ajv = new Ajv();
  const validateData = ajv.compile(JSONSchema);
  const valid = validateData(data);
  if (!valid) {
    throw new Error(
      `Invalid configuration: ${ajv.errorsText(validateData.errors)}`
    );
  }

  return data as T;
};
