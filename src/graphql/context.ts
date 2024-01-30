import { Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
import { DataSources } from "./datasources";

export enum Scope {
  ANONYMOUS,
  CUSTOMER,
}

export interface Context {
  headers: IncomingHttpHeaders;
  req: Request;
  res: Response;
  dataSources: DataSources;
  isAuthenticated: boolean;
  token?: string;
  ipRateLimiter?: string | string[];
  id?: string;
  scope?: Scope;
}

export const getUID = (scope: string, type: string): string =>
  scope.split(type)[1].slice(1).split(" ")[0].replace("id:", "");
