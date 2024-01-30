import { readFileSync } from "fs";
import { DocumentNode, parse, Source } from "graphql";
import { join, resolve } from "path";

export const importSchema = (filePath: string): DocumentNode => {
  const rawSchema = readFileSync(filePath, "utf-8").trim();
  return parse(new Source(rawSchema));
};

export const getFilePath = (fileName: string): string =>
  join(resolve(process.cwd(), `${__dirname}/schemas`), fileName);
