"use strict";

import { Response } from "express";

const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
};

const REASON_PHRASE = {
  OK: "OK",
  CREATED: "Created",
};

interface SuccessResponseParams {
  statusCode?: number;
  message?: string;
  reasonStatusCode?: string;
  metadata?: any;
}

class SuccessResponse {
  status: number;
  metadata: any;
  message: string;

  constructor({
    statusCode = STATUS_CODE.OK,
    message,
    reasonStatusCode = REASON_PHRASE.OK,
    metadata = {},
  }: SuccessResponseParams) {
    this.status = statusCode;
    this.metadata = metadata;
    this.message = message || reasonStatusCode;
  }

  send(res: Response, headers: Record<string, string> = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }: SuccessResponseParams) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = STATUS_CODE.CREATED,
    metadata,
  }: SuccessResponseParams) {
    super({ message, statusCode, metadata });
  }
}

export { OK, CREATED, SuccessResponse };
