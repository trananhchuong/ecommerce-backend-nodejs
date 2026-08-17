"use strict";

import { Request, Response, NextFunction, RequestHandler } from "express";
import { ForbiddenError } from "../core/error.response";
import { findById } from "../services/apikey.services";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return next(new ForbiddenError("Error: Forbidden Error"));
    }
    // check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return next(new ForbiddenError("Error: Forbidden Error"));
    }

    req.objKey = objKey;
    return next();
  } catch (error) {
    return next(error);
  }
};

const permission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.objKey?.permissions) {
      return next(new ForbiddenError("Permission denied"));
    }
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return next(new ForbiddenError("Permission denied"));
    }
    return next();
  };
};

export { apiKey, permission };
